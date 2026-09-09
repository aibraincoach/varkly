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
          className="grid grid-cols-[1fr_auto] items-baseline gap-3.5 text-sm"
        >
          <span className="font-medium flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${VARK_COLORS[style.code]}`}
              aria-hidden="true"
            />
            {style.name}
          </span>
          <span className="font-mono text-[13px] text-muted-1 whitespace-nowrap">
            {style.value} · {style.pct}%
          </span>
          <div className="col-span-full h-2.5 bg-track rounded-[5px] overflow-hidden">
            <div
              className={`h-full rounded-[5px] transition-[width] duration-[600ms] ease-[cubic-bezier(.4,0,.2,1)] ${VARK_COLORS[style.code]}`}
              style={{ width: `${style.barPct}%` }}
            />
          </div>
        </div>
      ))}
    </>
  );
};

export default ScoreRows;
