import React from 'react';
import { Link } from 'react-router-dom';
import { getProgressPct } from './panelsLogic';

type PanelsHeaderProps = {
  progressLabel: string;
  active: number;
};

const PanelsHeader: React.FC<PanelsHeaderProps> = ({ progressLabel, active }) => {
  const progressPct = getProgressPct(active);

  return (
    <header className="h-[72px] flex items-center justify-between">
      <Link
        to="/"
        className="flex items-center gap-2.5 font-bold text-xl tracking-[-0.02em] text-ink hover:text-muted-1"
      >
        <img
          src="/varkly-icon.svg"
          alt=""
          width={26}
          height={26}
          className="grayscale contrast-[1.2]"
        />
        Varkly<span className="text-ink">.</span>
      </Link>
      <div className="flex items-center gap-5 text-[13px] text-muted-2">
        <span className="font-mono">{progressLabel}</span>
        <div
          className="w-[120px] h-[3px] bg-line rounded-sm overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quiz progress"
        >
          <div
            className="h-full bg-ink rounded-sm transition-[width] duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </header>
  );
};

export default PanelsHeader;
