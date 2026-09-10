import React from 'react';
import { Link } from 'react-router-dom';
import { getProgressPct } from './panelsLogic';
import ThemeToggle from './ThemeToggle';

type PanelsHeaderProps = {
  progressLabel: string;
  active: number;
};

const PanelsHeader: React.FC<PanelsHeaderProps> = ({ progressLabel, active }) => {
  const progressPct = getProgressPct(active);

  return (
    <header className="h-[72px] flex items-center justify-between gap-3 min-w-0">
      <Link
        to="/"
        className="flex flex-shrink-0 items-center gap-2.5 font-bold text-xl tracking-[-0.02em] text-ink hover:text-muted-1"
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
      <div className="flex min-w-0 flex-shrink items-center gap-2 text-[11px] text-muted-2 sm:gap-5 sm:text-[13px]">
        <span className="font-mono whitespace-nowrap">{progressLabel}</span>
        <div
          className="h-[3px] w-[72px] flex-shrink-0 bg-line rounded-sm overflow-hidden sm:w-[120px]"
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
        <ThemeToggle />
      </div>
    </header>
  );
};

export default PanelsHeader;
