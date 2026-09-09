import React from 'react';
import type { ResultsExplanation, ScoreSummary } from '../../types';
import ScoreRows from './ScoreRows';
import ExplanationCard from './ExplanationCard';
import { getResultsEyebrow } from './panelsLogic';

type ResultsViewProps = {
  answeredCount: number;
  summary: ScoreSummary;
  explanation: ResultsExplanation;
  onCopyLink: () => void;
  copyLinkLabel: string;
  isShared: boolean;
};

const ResultsView: React.FC<ResultsViewProps> = ({
  answeredCount,
  summary,
  explanation,
  onCopyLink,
  copyLinkLabel,
  isShared,
}) => {
  return (
    <>
      <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-3">
        {getResultsEyebrow(isShared, answeredCount)}
      </div>
      <h1 className="mt-3.5 mb-[22px] min-h-[5.4em] text-[clamp(18px,1.5vw,23px)] leading-[1.35] font-semibold tracking-[-0.02em] text-pretty">
        <span className="block text-[clamp(28px,2.4vw,38px)] leading-[1.1] tracking-[-0.035em] mb-2.5">
          {summary.headline}
        </span>
        <span className="block font-normal text-[15px] leading-[1.55] text-muted-1 max-w-[46ch]">
          {summary.blurb}
        </span>
      </h1>
      <div className="panels-aside-body content-between">
        <div className="grid gap-2">
          <ScoreRows styles={summary.styles} />
        </div>
        <ExplanationCard explanation={explanation} />
        <button
          type="button"
          onClick={onCopyLink}
          className="justify-self-start text-sm font-semibold text-ink underline underline-offset-2 hover:text-muted-1"
          aria-live="polite"
        >
          {copyLinkLabel}
        </button>
      </div>
    </>
  );
};

export default ResultsView;
