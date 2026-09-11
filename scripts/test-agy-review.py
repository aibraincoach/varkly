#!/usr/bin/env python3
"""Offline review-controller checks. Fake AGY only; no provider or app execution."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

MODULE = Path(__file__).with_name('agy-review.py')
spec = importlib.util.spec_from_file_location('review_controller', MODULE)
review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)
CATALOG = 'gemini-3.8-flash-high\tGemini 3.8 Flash (High)\ngemini-3.8-flash-medium\tGemini 3.8 Flash (Medium)\ngemini-3.8-flash-low\tGemini 3.8 Flash (Low)\ngemini-3.7-flash-high\tGemini 3.7 Flash (High)\ngemini-3.7-flash-medium\tGemini 3.7 Flash (Medium)\ngemini-3.7-flash-low\tGemini 3.7 Flash (Low)\ngemini-3.6-flash-high\tGemini 3.6 Flash (High)\ngemini-3.6-flash-medium\tGemini 3.6 Flash (Medium)\ngemini-3.6-flash-low\tGemini 3.6 Flash (Low)\ngemini-3.1-pro-high\tGemini 3.1 Pro (High)\ngemini-3.1-pro-low\tGemini 3.1 Pro (Low)\nclaude-sonnet-4-6\tClaude Sonnet 4.6 (Thinking)\nclaude-opus-4-6-thinking\tClaude Opus 4.6 (Thinking)\ngpt-oss-120b-medium\tGPT-OSS 120B (Medium)\n'


class Selection(unittest.TestCase):
    def test_selection(self):
        policy = {'retired_through': [3, 1]}
        self.assertEqual(review.choose_model(CATALOG, policy), 'gemini-3.8-flash-high')
        self.assertEqual(review.choose_model(CATALOG + 'gemini-3.9-pro-high\tGemini 3.9 Pro (High)\n', policy), 'gemini-3.9-pro-high')
        self.assertEqual(review.choose_model(CATALOG + 'gemini-3.10-flash-high\tGemini 3.10 Flash (High)\n', policy), 'gemini-3.10-flash-high')
        for text in ['', 'bad', 'gemini-3.1-pro-high\tGemini 3.1 Pro (High)',
                     'gemini-3.8-flash-medium\tGemini 3.8 Flash (Medium)',
                     'gemini-3.8-flash-high\tGemini 3.8 Flash (Medium)']:
            with self.subTest(text=text), self.assertRaises(ValueError):
                review.choose_model(text, policy)


class Dispatch(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.repo = self.root / 'repo'
        self.repo.mkdir()
        self.env = dict(os.environ, GIT_CONFIG_NOSYSTEM='1')
        self.git('init', '-q')
        self.git('config', 'user.name', 'Fixture')
        self.git('config', 'user.email', 'fixture@example.invalid')
        self.git('remote', 'add', 'origin', 'https://github.com/aibraincoach/fixture.git')
        (self.repo / 'config').mkdir()
        (self.repo / 'config/agy-review-policy.json').write_text(json.dumps({
            'schema_version': 1, 'repository': 'aibraincoach/fixture', 'retired_through': [3, 1],
            'effort': 'high', 'packet_limit_bytes': 150000, 'timeout_seconds': 5}))
        self.git('add', '.')
        self.git('commit', '-qm', 'fixture')
        self.head = self.git('rev-parse', 'HEAD')
        self.proof = self.root / 'proof.md'
        self.proof.write_text('PM dispatch: fixture owns the exact-head review; no other dispatch exists.\n')
        self.bin = self.root / 'bin'
        self.bin.mkdir()
        fake = self.bin / 'agy'
        fake.write_text('''#!/usr/bin/env python3
import sys,json,os
from pathlib import Path
if sys.argv[1:] == ['models']:
 print('gemini-3.1-pro-high\\tGemini 3.1 Pro (High)\\ngemini-3.8-flash-high\\tGemini 3.8 Flash (High)')
else:
 with Path(os.environ['REVIEW_FIXTURE_CALLS']).open('a') as f:f.write(json.dumps(sys.argv[1:])+'\\n')
 if os.environ.get('REVIEW_FIXTURE_QUOTA'):
  print(json.dumps({'status':'SUCCESS','response':('explanation '*500+'\\n' if os.environ.get('REVIEW_FIXTURE_QUOTA')=='long' else '')+'You have reached the quota limit. Resets in 44h11m15s'}))
 else:
  print(json.dumps({'status':'SUCCESS','response':'Grounded fixture review: source contains REVIEW_SCOPE. No fixture findings.'}))
''')
        fake.chmod(0o755)
        self.calls = self.root / 'calls'
        self.env.update(PATH=str(self.bin) + os.pathsep + self.env['PATH'], REVIEW_FIXTURE_CALLS=str(self.calls))

    def tearDown(self):
        self.tmp.cleanup()

    def git(self, *args):
        return subprocess.check_output(['git', *args], cwd=self.repo, stderr=subprocess.PIPE, text=True).strip()

    def cli(self, *args, ok=True, repo=None):
        r = subprocess.run([os.sys.executable, str(MODULE), '--repo', str(repo or self.repo), *args],
                           env=self.env, text=True, capture_output=True)
        if ok:
            self.assertEqual(r.returncode, 0, r.stderr)
            return json.loads(r.stdout)
        self.assertNotEqual(r.returncode, 0, r.stdout)
        return r

    def plan(self, count=1, route='agy', question=''):
        args = ['plan', '--head', self.head, '--base', self.head, '--pr', 'fixture',
                '--owner', 'fixture-pm', '--dispatch', str(self.proof), '--route', route, '--question', question]
        for i in range(count):
            path = self.root / f'packet{i}.txt'
            path.write_text(f'REVIEW_HEAD={self.head}\nREVIEW_SCOPE=fixture slice {i}\nEND_REVIEW_PACKET={self.head}\n')
            args += ['--packet', str(path)]
        return self.cli(*args)['set']

    def test_duplicate_and_worktree_shared_state(self):
        set_id = self.plan()
        self.cli('run', '--id', set_id)
        self.cli('run', '--id', set_id, ok=False)
        other = self.root / 'linked'
        self.git('worktree', 'add', '--detach', str(other), 'HEAD')
        self.cli('run', '--id', set_id, repo=other, ok=False)
        self.assertEqual(len(self.calls.read_text().splitlines()), 1)
        self.cli('triage', '--id', set_id, '--disposition', 'accepted', '--evidence', str(self.proof))
        with self.assertRaises(AssertionError):
            self.plan()
        argv = json.loads(self.calls.read_text().splitlines()[0])
        self.assertEqual(argv[argv.index('--model') + 1], 'gemini-3.8-flash-high')
        self.assertEqual(argv[argv.index('--effort') + 1], 'high')
        self.assertNotIn('--dangerously-skip-permissions', argv)
        self.assertNotIn('--add-dir', argv)

    def test_concurrent_attempts_dispatch_once(self):
        set_id = self.plan()
        argv = [os.sys.executable, str(MODULE), '--repo', str(self.repo), 'run', '--id', set_id]
        first = subprocess.Popen(argv, env=self.env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        second = subprocess.Popen(argv, env=self.env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        first.communicate(timeout=15)
        second.communicate(timeout=15)
        self.assertEqual(sorted([first.returncode, second.returncode]), [0, 2])
        self.assertEqual(len(self.calls.read_text().splitlines()), 1)

    def test_exit_zero_quota_and_recovery(self):
        set_id = self.plan()
        self.env['REVIEW_FIXTURE_QUOTA'] = '1'
        self.cli('run', '--id', set_id, ok=False)
        self.cli('run', '--id', set_id, ok=False)
        self.cli('select-model', ok=False)
        self.assertEqual(len(self.calls.read_text().splitlines()), 1)
        self.cli('resolve-quota', '--reason', 'Fixture passive recovery evidence', '--evidence', str(self.proof))
        self.cli('resolve-attempt', '--id', set_id, '--decision', 'resume', '--reason', 'Complete missing original coverage', '--evidence', str(self.proof))
        del self.env['REVIEW_FIXTURE_QUOTA']
        self.cli('run', '--id', set_id)
        state = self.cli('status')
        self.assertEqual(len(state['sets'][set_id]['packets'][0]['attempts']), 2)
        self.assertTrue(any(e['event'] == 'quota-resolved' for e in state['events']))

    def test_split_progress_and_route_independence(self):
        set_id = self.plan(2)
        self.cli('run', '--id', set_id, '--packet', '2', ok=False)
        self.cli('run', '--id', set_id)
        self.cli('triage', '--id', set_id, '--disposition', 'accepted', '--evidence', str(self.proof))
        self.env['REVIEW_FIXTURE_QUOTA'] = '1'
        self.cli('run', '--id', set_id, '--packet', '2', ok=False)
        state = self.cli('status')
        self.assertEqual(state['sets'][set_id]['packets'][0]['status'], 'accepted')
        pplx = self.plan(route='pplx')
        attempt = self.cli('begin', '--id', pplx)
        self.cli('record', '--id', pplx, '--attempt', attempt['id'], '--capture', str(self.proof), '--status', 'received')
        self.assertEqual(len(self.calls.read_text().splitlines()), 2)

    def test_long_quota_wrapper_and_quoted_code(self):
        self.assertTrue(review.response_quota('explanation ' * 500 + '\nYou have reached the quota limit. Resets in 44h11m15s'))
        self.assertFalse(review.response_quota('Finding in handler.py:\n```\nRESOURCE_EXHAUSTED\n```\nThis is a source quote, not a quota diagnostic.'))
        set_id = self.plan()
        self.env['REVIEW_FIXTURE_QUOTA'] = 'long'
        self.cli('run', '--id', set_id, ok=False)
        self.assertIn('agy', self.cli('status')['quota'])

    def test_unresolved_triage_cannot_be_bypassed(self):
        set_id = self.plan()
        self.cli('run', '--id', set_id)
        self.cli('triage', '--id', set_id, '--disposition', 'needs-fix', '--evidence', str(self.proof))
        with self.assertRaises(AssertionError):
            self.plan(question='A different question cannot bypass unfinished coverage')

    def test_cross_host_recovery_is_explicit(self):
        set_id = self.plan(route='pplx')
        self.cli('begin', '--id', set_id)
        self.cli('resolve-attempt', '--id', set_id, '--decision', 'abandon', '--reason', 'PM reconciled stopped browser owner', '--evidence', str(self.proof), ok=False)
        self.cli('resolve-attempt', '--id', set_id, '--decision', 'abandon', '--reason', 'PM reconciled stopped browser owner', '--evidence', str(self.proof), '--reconcile-owner')
        self.assertEqual(self.cli('status')['sets'][set_id]['packets'][0]['status'], 'abandoned')

    def test_manifest_tamper_and_missing_sentinel(self):
        set_id = self.plan()
        state = self.cli('status')
        Path(state['sets'][set_id]['packets'][0]['path']).write_text('changed')
        self.cli('run', '--id', set_id, ok=False)
        self.assertFalse(self.calls.exists())


if __name__ == '__main__':
    unittest.main()
