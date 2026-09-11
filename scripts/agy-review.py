#!/usr/bin/env python3
"""Project-local review controller. Python 3 standard library; never installs tools."""
import argparse
import contextlib
import datetime
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import signal
import socket
import subprocess
import sys
import tempfile
import time
import uuid


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def digest(value):
    return hashlib.sha256(value.encode() if isinstance(value, str) else value).hexdigest()


def read_json(path, default=None):
    return json.loads(path.read_text()) if path.exists() else default


def write_json(path, value):
    tmp = path.with_name(path.name + '.' + uuid.uuid4().hex + '.tmp')
    with tmp.open('x') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')
    os.chmod(tmp, 0o600)
    os.replace(tmp, path)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def choose_model(catalog, policy):
    choices = []
    retired = tuple(policy['retired_through'])
    for line in catalog.splitlines():
        if not line.strip():
            continue
        parts = line.split('\t')
        require(len(parts) == 2, 'Malformed model catalog; no fallback')
        slug, label = parts
        if not slug.startswith('gemini-'):
            continue
        match = re.fullmatch(r'gemini-(\d+)\.(\d+)-(pro|flash)-(high|medium|low)', slug)
        require(match, 'Unrecognized Gemini identifier: ' + slug)
        major, minor, family, effort = match.groups()
        require(label == f'Gemini {major}.{minor} {family.title()} ({effort.title()})',
                'Catalog slug/label disagreement')
        version = (int(major), int(minor))
        if version > retired and effort == 'high':
            choices.append((family == 'pro', version, slug))
    require(choices, 'No eligible Gemini High model; do not use historical/global defaults')
    return max(choices)[2]


def process_identity(pid):
    result = subprocess.run(['ps', '-p', str(pid), '-o', 'lstart=', '-o', 'comm='],
                            capture_output=True, text=True, timeout=5,
                            env=dict(os.environ, LC_ALL='C'))
    return result.stdout.strip() if result.returncode == 0 else None


def response_quota(text):
    # A review may quote quota-handling code. Only diagnostic lines outside quoted code
    # identify a successful wrapper whose response is actually a provider refusal.
    fenced = False
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith(('```', '~~~')):
            fenced = not fenced
            continue
        if fenced or stripped.startswith('>'):
            continue
        plain = stripped.lstrip('-*# ').replace('**', '')
        if re.match(r"(?i)^(?:error[: ]+)?(?:you(?: have|'ve) (?:reached|exceeded|exhausted)|"
                    r"quota (?:exceeded|exhausted|limit reached)|resource_exhausted|"
                    r"(?:http |status )?429\b|resets in \d|insufficient quota)", plain):
            if quota_error(plain):
                return True
    return False


def quota_error(text):
    # Search provider errors, not a successful review's quotation of source/policy.
    return bool(re.search(r'resource_exhausted|(?:http|status|code)\D{0,5}429\b|'
                          r'(?:reached|exceeded|exhausted)[^\n]{0,70}quota|'
                          r'quota[^\n]{0,70}(?:exhausted|exceeded|limit reached)|'
                          r'resets in \d|insufficient quota', text, re.I))


class Controller:
    def __init__(self, root):
        self.repo = Path(self.git_at(root, 'rev-parse', '--show-toplevel')).resolve()
        common = self.git('rev-parse', '--git-common-dir')
        self.state = (self.repo / common).resolve() / 'review-state'
        self.state.mkdir(mode=0o700, parents=True, exist_ok=True)
        self.policy = read_json(self.repo / 'config/agy-review-policy.json')
        require(self.policy and self.policy.get('schema_version') == 1, 'Missing/unsupported local policy')
        require(self.policy.get('effort') == 'high', 'Policy must require High reasoning')
        self.identity = self.policy['repository']
        remote = self.git('config', '--get', 'remote.origin.url')
        match = re.search(r'github\.com[:/]([^/]+/[^/]+?)(?:\.git)?$', remote)
        require(match and match.group(1).lower() == self.identity.lower(), 'Policy/origin identity mismatch')
        self.db_path = self.state / 'ledger.json'

    @staticmethod
    def git_at(root, *args):
        return subprocess.check_output(['git', '--no-optional-locks', '-C', str(root), *args],
                                       stderr=subprocess.PIPE, text=True).strip()

    def git(self, *args):
        return self.git_at(self.repo, *args)

    @contextlib.contextmanager
    def transaction(self):
        # The OS releases this short mutex on crash; durable running attempts remain blocked.
        with (self.state / 'ledger.lock').open('a') as lock:
            deadline = time.monotonic() + 2
            while True:  # Bounded local mutex wait, never a reviewer retry.
                try:
                    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
                    break
                except BlockingIOError:
                    require(time.monotonic() < deadline, 'Review ledger busy; no dispatch occurred')
                    time.sleep(0.02)
            db = read_json(self.db_path, {'schema_version': 1, 'sets': {}, 'events': [], 'quota': {}})
            yield db
            write_json(self.db_path, db)

    def evidence(self, path):
        source = Path(path).resolve()
        raw = source.read_bytes()
        require(raw.strip(), 'Evidence must not be empty')
        target = self.state / 'evidence' / digest(raw)
        target.parent.mkdir(exist_ok=True)
        if not target.exists():
            target.write_bytes(raw)
            os.chmod(target, 0o600)
        return {'sha256': digest(raw), 'path': str(target), 'recorded': now()}

    def get_set(self, db, set_id):
        require(set_id in db['sets'], 'Unknown review set')
        return db['sets'][set_id]

    def plan(self, args):
        head = self.git('rev-parse', '--verify', '--end-of-options', args.head + '^{commit}')
        base = self.git('rev-parse', '--verify', '--end-of-options', args.base + '^{commit}')
        packets = []
        for index, path in enumerate(args.packet, 1):
            raw = Path(path).read_bytes()
            text = raw.decode('utf-8')
            require(len(raw) < self.policy['packet_limit_bytes'], 'Packet exceeds local byte limit')
            require(f'REVIEW_HEAD={head}' in text and
                    text.rstrip().endswith(f'END_REVIEW_PACKET={head}'), 'Packet head/sentinel missing')
            require('REVIEW_SCOPE=' in text, 'Declare bounded packet coverage with REVIEW_SCOPE=')
            require(digest(raw) not in [p['sha256'] for p in packets], 'Duplicate packet content')
            packets.append({'id': str(index), 'sha256': digest(raw), 'status': 'pending',
                            'attempts': [], 'text': text})
        require(packets, 'No packets')
        dispatch = self.evidence(args.dispatch)
        with self.transaction() as db:
            prior = [s for s in db['sets'].values() if s['head'] == head and s['route'] == args.route]
            require(not any(p['status'] in ('running', 'pending', 'received', 'failed', 'quota', 'needs-fix', 'ungrounded')
                            for s in prior for p in s['packets']),
                    'Existing unfinished set: inspect/resolve it; a new set cannot bypass its reservation')
            require(not prior or (args.question and args.question.strip()),
                    'Same-head same-route review requires a documented unresolved question')
            require(not db['quota'].get(args.route), args.route.upper() + ' quota stop is active')
            set_id = digest(self.identity + head + args.route)[:16] + '-' + str(len(prior) + 1)
            folder = self.state / set_id
            folder.mkdir(mode=0o700)
            for packet in packets:
                content = packet.pop('text')
                f = folder / ('packet-' + packet['id'] + '.txt')
                f.write_text(content)
                os.chmod(f, 0o600)
                packet['path'] = str(f)
            db['sets'][set_id] = {'id': set_id, 'repository': self.identity, 'head': head, 'base': base,
                                  'diff_sha256': digest(subprocess.check_output(['git', '--no-optional-locks', '-C', str(self.repo), 'diff', '--no-ext-diff', '--no-textconv', base + '...' + head])),
                                  'route': args.route, 'pr': args.pr, 'owner': args.owner,
                                  'dispatch': dispatch, 'question': args.question, 'created': now(),
                                  'packets': packets}
            db['events'].append({'time': now(), 'event': 'planned', 'set': set_id})
        return {'set': set_id, 'head': head, 'packets': len(packets)}

    def reserve(self, set_id, packet_id, expected_route):
        with self.transaction() as db:
            review = self.get_set(db, set_id)
            require(review['route'] == expected_route, 'Wrong route for this operation')
            require(not db['quota'].get(expected_route), expected_route.upper() + ' quota stop is active')
            packet = next((p for p in review['packets'] if p['id'] == packet_id), None)
            require(packet and packet['status'] == 'pending', 'Packet is not dispatchable; inspect status/recovery')
            index = review['packets'].index(packet)
            require(all(p['status'] == 'accepted' for p in review['packets'][:index]),
                    'Triage prior packets successfully before dispatching the next')
            require(digest(Path(packet['path']).read_bytes()) == packet['sha256'], 'Packet changed after planning')
            attempt = {'id': uuid.uuid4().hex, 'started': now(), 'pid': os.getpid(),
                       'host': socket.gethostname(), 'process_identity': process_identity(os.getpid()), 'status': 'running'}
            packet['attempts'].append(attempt)
            packet['status'] = 'running'
            db['events'].append({'time': now(), 'event': 'reserved', 'set': set_id, 'attempt': attempt['id']})
        return review, packet, attempt

    def finish(self, set_id, packet_id, attempt_id, status, metadata):
        with self.transaction() as db:
            review = self.get_set(db, set_id)
            packet = next(p for p in review['packets'] if p['id'] == packet_id)
            require(packet['attempts'][-1]['id'] == attempt_id and packet['status'] == 'running',
                    'Attempt ownership changed; refusing overwrite')
            packet['status'] = status
            packet['attempts'][-1].update(metadata, status=status, finished=now())
            if status == 'quota':
                db['quota'][review['route']] = {'time': now(), 'set': set_id, 'attempt': attempt_id, 'evidence': metadata}
            db['events'].append({'time': now(), 'event': status, 'set': set_id, 'attempt': attempt_id})

    def run(self, args):
        review, packet, attempt = self.reserve(args.id, args.packet, 'agy')
        folder = self.state / args.id / attempt['id']
        folder.mkdir(mode=0o700)
        metadata = {'folder': str(folder)}
        try:
            executable = shutil.which('agy')
            require(executable, 'agy is not on PATH; no automatic installation')
            catalog = subprocess.run([executable, 'models'], capture_output=True, text=True, timeout=30)
            (folder / 'catalog.txt').write_text(catalog.stdout)
            (folder / 'catalog-stderr.txt').write_text(catalog.stderr)
            if quota_error(catalog.stdout + '\n' + catalog.stderr):
                self.finish(args.id, args.packet, attempt['id'], 'quota', metadata)
                return {'status': 'quota', **metadata}
            require(catalog.returncode == 0, 'Catalog failed; no model fallback')
            model = choose_model(catalog.stdout, self.policy)
            metadata.update(model=model, effort='high', catalog_sha256=digest(catalog.stdout))
            argv = [executable, '--model', model, '--effort', 'high', '--sandbox',
                    '--disable-slash-commands', '--output-format', 'json',
                    '--print-timeout', str(self.policy['timeout_seconds']) + 's',
                    '--log-file', str(folder / 'invocation.log'), '--print',
                    'Review only the supplied exact-source packet. Do not use tools, run commands, '
                    'browse, or read/write files. Return grounded findings with verbatim source evidence '
                    'and actual paths; separate uncertainty. No clean-pass counter.\n\n' + Path(packet['path']).read_text()]
            # No permission bypass, add-dir, agent selection, continuation or unsupported plan/disable combination.
            metadata['argv_without_prompt'] = argv[:-1]
            with tempfile.TemporaryDirectory(prefix='review-', dir=self.state) as empty:
                with (folder / 'stdout.json').open('w') as out, (folder / 'stderr.txt').open('w') as err:
                    proc = subprocess.Popen(argv, cwd=empty, stdout=out, stderr=err, start_new_session=True)
                    try:
                        code = proc.wait(timeout=self.policy['timeout_seconds'] + 15)
                    except (subprocess.TimeoutExpired, KeyboardInterrupt):
                        os.killpg(proc.pid, signal.SIGTERM)
                        try:
                            proc.wait(timeout=5)
                        except subprocess.TimeoutExpired:
                            os.killpg(proc.pid, signal.SIGKILL)
                            proc.wait()
                        raise ValueError('Review interrupted/timed out; inspect capture before recovery')
            raw = (folder / 'stdout.json').read_text()
            stderr = (folder / 'stderr.txt').read_text()
            metadata.update(exit_code=code, capture_sha256=digest(raw))
            try:
                result = json.loads(raw)
            except json.JSONDecodeError:
                result = {}
            success = code == 0 and result.get('status') == 'SUCCESS' and bool(result.get('response', '').strip())
            # SUCCESS wrappers can still contain only a provider quota failure, with no review.
            response = str(result.get('response', ''))
            provider_error = '\n'.join(str(result.get(k, '')) for k in ['error', 'error_message', 'errors']) + '\n' + stderr
            quota = quota_error(provider_error) or (not success and quota_error(raw)) or response_quota(response)
            status = 'quota' if quota else ('received' if success else 'failed')
            self.finish(args.id, args.packet, attempt['id'], status, metadata)
            return {'status': status, 'set': args.id, 'packet': args.packet, **metadata}
        except (Exception, KeyboardInterrupt) as error:
            metadata['error'] = str(error)
            self.finish(args.id, args.packet, attempt['id'], 'failed', metadata)
            raise

    def triage(self, args):
        evidence = self.evidence(args.evidence)
        with self.transaction() as db:
            review = self.get_set(db, args.id)
            packet = next(p for p in review['packets'] if p['id'] == args.packet)
            require(packet['status'] in ('received', 'accepted', 'needs-fix', 'ungrounded'), 'A completed capture is required before triage')
            packet.setdefault('triage_history', []).append({'disposition': args.disposition, 'evidence': evidence})
            packet.update(status=args.disposition, triage=evidence)
            accepted = all(p['status'] == 'accepted' for p in review['packets'])
            review['receipt'] = {'status': 'accepted' if accepted else 'incomplete', 'time': now(),
                                 'head': review['head'], 'base': review['base'], 'diff_sha256': review['diff_sha256']}
        return review['receipt']

    def recover(self, args):
        evidence = self.evidence(args.evidence)
        require(args.reason.strip(), 'A recovery reason is required')
        with self.transaction() as db:
            if args.command == 'resolve-quota':
                require(db['quota'].get(args.route), 'No quota stop exists for this route')
                db['events'].append({'event': 'quota-resolved', 'time': now(), 'route': args.route, 'previous': db['quota'][args.route],
                                     'reason': args.reason, 'evidence': evidence})
                del db['quota'][args.route]
            else:
                review = self.get_set(db, args.id)
                packet = next(p for p in review['packets'] if p['id'] == args.packet)
                require(packet['status'] in ('running', 'failed', 'quota', 'ungrounded', 'needs-fix') or (args.decision == 'abandon' and packet['status'] in ('pending', 'received')),
                        'Recovery cannot erase accepted coverage or bypass pending triage')
                if packet['status'] == 'running':
                    attempt = packet['attempts'][-1]
                    if review['route'] == 'pplx' or attempt['host'] != socket.gethostname():
                        require(args.reconcile_owner, 'Explicit PM ownership reconciliation is required; no remote process is interrupted')
                    else:
                        current = process_identity(attempt['pid'])
                        saved = attempt.get('process_identity')
                        if saved and current == saved:
                            raise ValueError('Recorded dispatch owner is still running; do not interrupt it')
                        if not (saved and current and current != saved):
                            try:
                                os.kill(attempt['pid'], 0)
                            except ProcessLookupError:
                                pass
                            except PermissionError:
                                require(args.reconcile_owner, 'Process identity inaccessible; explicit PM reconciliation required')
                            else:
                                require(args.reconcile_owner, 'Process identity uncertain; explicit PM reconciliation required')
                require(args.decision == 'abandon' or not db['quota'].get(review['route']), 'Resolve the quota condition before resuming')
                db['events'].append({'event': 'attempt-resolved', 'time': now(), 'set': args.id,
                                     'packet': args.packet, 'previous': packet['status'],
                                     'decision': args.decision, 'reason': args.reason, 'evidence': evidence, 'ownership_reconciled': args.reconcile_owner})
                packet['status'] = 'pending' if args.decision == 'resume' else 'abandoned'
        return {'status': 'recorded; no reviewer called'}

    def record(self, args):
        capture = self.evidence(args.capture)
        with self.transaction() as db:
            require(self.get_set(db, args.id)['route'] == 'pplx', 'Manual record is only for the approved PPLX harness')
        self.finish(args.id, args.packet, args.attempt, args.status, {'capture': capture})
        return {'status': args.status, 'capture': capture}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', default='.', help='Project context; never a sibling policy source')
    sub = parser.add_subparsers(dest='command', required=True)
    sub.add_parser('status')
    sub.add_parser('select-model', help='Catalog metadata only; no review')
    p = sub.add_parser('plan')
    for name in ['head', 'base', 'pr', 'owner', 'dispatch']:
        p.add_argument('--' + name, required=True)
    p.add_argument('--packet', action='append', required=True)
    p.add_argument('--route', choices=['agy', 'pplx'], default='agy')
    p.add_argument('--question', default='')
    for name in ['run', 'begin', 'triage', 'record', 'resolve-attempt']:
        p = sub.add_parser(name)
        p.add_argument('--id', required=True)
        p.add_argument('--packet', default='1')
        if name == 'triage':
            p.add_argument('--disposition', required=True, choices=['accepted', 'needs-fix', 'ungrounded'])
            p.add_argument('--evidence', required=True)
        if name == 'record':
            p.add_argument('--attempt', required=True)
            p.add_argument('--capture', required=True)
            p.add_argument('--status', choices=['received', 'failed', 'quota'], required=True)
        if name == 'resolve-attempt':
            p.add_argument('--reconcile-owner', action='store_true', help='PM evidence confirms interrupted remote/unknown/PPLX ownership; never overrides a known live AGY owner')
            p.add_argument('--decision', choices=['resume', 'abandon'], required=True)
            p.add_argument('--reason', required=True)
            p.add_argument('--evidence', required=True)
    p = sub.add_parser('resolve-quota')
    p.add_argument('--route', choices=['agy', 'pplx'], default='agy')
    p.add_argument('--reason', required=True)
    p.add_argument('--evidence', required=True)
    args = parser.parse_args()
    os.umask(0o077)
    c = Controller(args.repo)
    if args.command == 'status':
        result = read_json(c.db_path, {'sets': {}, 'quota': {}})
    elif args.command == 'select-model':
        with c.transaction() as db:
            require(not db['quota'].get('agy'), 'AGY quota stop is active')
        executable = shutil.which('agy')
        require(executable, 'agy is not on PATH')
        out = subprocess.run([executable, 'models'], capture_output=True, text=True, timeout=30)
        require(out.returncode == 0 and not quota_error(out.stdout + out.stderr), 'Catalog failed; stop')
        result = {'model': choose_model(out.stdout, c.policy), 'effort': 'high'}
    elif args.command == 'plan':
        result = c.plan(args)
    elif args.command == 'run':
        result = c.run(args)
    elif args.command == 'begin':
        _, _, attempt = c.reserve(args.id, args.packet, 'pplx')
        result = attempt
    elif args.command == 'record':
        result = c.record(args)
    elif args.command == 'triage':
        result = c.triage(args)
    else:
        result = c.recover(args)
    print(json.dumps(result, indent=2))
    if result.get('status') in ('failed', 'quota'):
        return 2
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (Exception, KeyboardInterrupt) as error:
        print('STOP: ' + str(error), file=sys.stderr)
        sys.exit(2)
