import React from 'react';
import { VARK_STYLE_TILES } from '../../data/varkStyles';

const LandingView: React.FC = () => {
  return (
    <>
      <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-3">
        VARK learning style · 13 scenarios · 90 seconds
      </div>
      <h1 className="mt-3.5 mb-[22px] min-h-[5.4em] text-[clamp(18px,1.5vw,23px)] leading-[1.35] font-semibold tracking-[-0.02em]">
        <span className="block text-[clamp(28px,2.4vw,38px)] leading-[1.1] tracking-[-0.035em] mb-2.5">
          See. Hear.
          <br />
          Read. Do.
        </span>
        <span className="block font-normal text-[15px] leading-[1.55] text-muted-1 max-w-[46ch] text-pretty">
          Thirteen everyday scenarios. Pick every answer that sounds like you, skip the ones that
          don&apos;t. At the end you get your VARK profile and two prompts that make any AI adapt to
          how you actually learn.
        </span>
      </h1>
      <div className="panels-aside-body content-between">
        <ul className="m-0 p-0 list-none grid gap-2 text-sm text-text-2">
          <li className="flex gap-2.5">
            <span className="text-muted-3 font-mono text-xs">01</span>
            Select all answers that apply to each scenario
          </li>
          <li className="flex gap-2.5">
            <span className="text-muted-3 font-mono text-xs">02</span>
            Skip questions that don&apos;t resonate with you
          </li>
          <li className="flex gap-2.5">
            <span className="text-muted-3 font-mono text-xs">03</span>
            Be honest — there are no wrong answers
          </li>
          <li className="flex gap-2.5">
            <span className="text-muted-3 font-mono text-xs">04</span>
            No account, nothing stored beyond this tab
          </li>
        </ul>
        <ul className="m-0 p-0 list-none grid grid-cols-2 gap-2" aria-label="The four VARK styles">
          {VARK_STYLE_TILES.map((tile) => (
            <li
              key={tile.code}
              className="border-[1.5px] border-line rounded-xl bg-surface px-3.5 py-3 flex flex-col gap-1.5"
            >
              <span className="flex items-center gap-2 text-[13px] font-semibold">
                <span className={`w-2 h-2 rounded-full ${tile.dotClass}`} aria-hidden="true" />
                {tile.name}
              </span>
              <span className="text-xs leading-[1.45] text-muted-1">{tile.blurb}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default LandingView;
