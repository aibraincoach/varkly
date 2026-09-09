import React from 'react';
import type { ResultsExplanation } from '../../types';

type ExplanationCardProps = {
  explanation: ResultsExplanation;
};

const ExplanationCard: React.FC<ExplanationCardProps> = ({ explanation }) => {
  return (
    <section
      aria-labelledby="explanation-title"
      className="border-[1.5px] border-line rounded-xl bg-white px-4 py-2.5"
    >
      <h2 id="explanation-title" className="m-0 mb-1 text-[13px] font-semibold tracking-normal">
        {explanation.title}
      </h2>
      {explanation.description && (
        <p className="m-0 mb-1.5 text-[13px] leading-[1.4] text-[#3a3a42] text-pretty">
          {explanation.description}
        </p>
      )}
      <ol className="m-0 p-0 list-none grid gap-0.5 text-[13px] leading-[1.4] text-[#3a3a42]">
        {explanation.tips.map((tip, index) => (
          <li key={tip} className="flex gap-2.5">
            <span className="pt-0.5 text-muted-3 font-mono text-[11px]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>{tip}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default ExplanationCard;
