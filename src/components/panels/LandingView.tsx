import React from 'react';

const LandingView: React.FC = () => {
  return (
    <>
      <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-3">
        VARK learning style · 13 scenarios · 90 seconds
      </div>
      <h1 className="mt-3.5 mb-[22px] min-h-[5.4em] text-[clamp(18px,1.5vw,23px)] leading-[1.35] font-semibold tracking-[-0.02em]">
        <span className="block text-[clamp(28px,2.4vw,38px)] leading-[1.1] tracking-[-0.035em]">
          See. Hear.
          <br />
          Read. Do.
        </span>
      </h1>
      <div className="panels-aside-body content-start">
        <p className="m-0 text-base leading-[1.55] text-muted-1 max-w-[40ch] text-pretty">
          Thirteen everyday situations. Pick every answer that sounds like you, skip the ones that
          don&apos;t. At the end you get your VARK profile and two prompts that make any AI adapt to
          how you actually learn.
        </p>
        <ul className="mt-2 mb-0 p-0 list-none grid gap-2 text-sm text-[#3a3a42]">
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
      </div>
    </>
  );
};

export default LandingView;
