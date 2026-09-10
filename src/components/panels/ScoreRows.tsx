import React from 'react';
import type { ScoreStyleSummary } from '../../types';

const VARK_COLORS: Record<string, string> = {
  V: 'bg-vark-v',
  A: 'bg-vark-a',
  R: 'bg-vark-r',
  K: 'bg-vark-k',
};

type ScoreRowsProps = {
  styles: ScoreStyleSummary[];
};

const ScoreRows: React.FC<ScoreRowsProps> = ({ styles }) => {
  return (
    <>
      {styles.map((style) => (
        <div
          key={style.code}
          className="grid grid-cols-[104px_minmax(0,1fr)_64px] items-center gap-3 text-[13px]"
        >
          <span className="font-medium flex items-center gap-2 whitespace-nowrap">
            <span
              className={`w-2 h-2 flex-none rounded-full ${VARK_COLORS[style.code]}`}
              aria-hidden="true"
            />
            {style.name}
          </span>
          <div className="h-2 bg-track rounded overflow-hidden">
            <div
              className={`h-full rounded transition-[width] duration-[600ms] ease-[cubic-bezier(.4,0,.2,1)] ${VARK_COLORS[style.code]}`}
              style={{ width: `${style.barPct}%` }}
            />
          </div>
          <span className="font-mono text-xs text-muted-1 whitespace-nowrap text-right">
            {style.value} · {style.pct}%
          </span>
        </div>
      ))}
    </>
  );
};

export default ScoreRows;
