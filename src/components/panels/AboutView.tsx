import React from 'react';

const AboutView: React.FC = () => {
  return (
    <>
      <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-3">
        About VARK · Fleming, 1987
      </div>
      <h1 className="mt-3.5 mb-[22px] min-h-[5.4em] text-[clamp(18px,1.5vw,23px)] leading-[1.35] font-semibold tracking-[-0.02em]">
        <span className="block text-[clamp(28px,2.4vw,38px)] leading-[1.1] tracking-[-0.035em] mb-2.5">
          A language for how you like things explained.
        </span>
        <span className="block font-normal text-[15px] leading-[1.55] text-muted-1 max-w-[46ch] text-pretty">
          VARK was developed by New Zealand educator Neil Fleming in 1987. It sorts the way people
          prefer to take in information into four modalities: Visual, Aural, Read/Write and
          Kinesthetic.
        </span>
      </h1>
      <div className="panels-aside-body content-between gap-3">
        <div className="grid gap-3 text-sm leading-[1.55] text-text-2">
          <p className="m-0 text-pretty">
            <strong className="font-semibold text-ink">It measures preference, not ability.</strong> A
            high Visual score means you reach for diagrams first, not that you can&apos;t learn from a
            lecture. Most people are multimodal.
          </p>
          <p className="m-0 text-pretty">
            <strong className="font-semibold text-ink">The evidence is mixed.</strong> Studies that
            teach to a person&apos;s stated style have not shown reliable gains in test scores. We
            don&apos;t claim VARK predicts how well you&apos;ll learn.
          </p>
          <p className="m-0 text-pretty">
            <strong className="font-semibold text-ink">Why Varkly uses it anyway.</strong> An AI will
            happily explain anything in any format. It just needs to be told which one. VARK gives you
            a clear, well-known vocabulary for that request, and the prompts we generate turn your
            answers into it.
          </p>
        </div>
      </div>
    </>
  );
};

export default AboutView;
