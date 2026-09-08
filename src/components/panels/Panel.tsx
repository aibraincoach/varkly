import React from 'react';
import type { PanelDefinition } from '../../data/panels';

type PanelProps = {
  panel: PanelDefinition;
  panelIndex: number;
  isActive: boolean;
  isLanding: boolean;
  isMobile: boolean;
  saturation: number;
  disabled: boolean;
  onActivate: () => void;
};

const Panel: React.FC<PanelProps> = ({
  panel,
  panelIndex,
  isActive,
  isLanding,
  isMobile,
  saturation,
  disabled,
  onActivate,
}) => {
  const num = String(panelIndex + 1).padStart(2, '0');
  const isResults = panelIndex === 13;
  const label = isResults ? 'Results' : panel.title;
  const ariaLabel = isResults ? 'Results' : `Question ${num}: ${panel.title}`;

  const flexClass = isActive
    ? isMobile
      ? 'flex-[1_1_auto] min-h-[260px]'
      : 'flex-[1_1_0] min-w-0'
    : isLanding
      ? isMobile
        ? 'flex-[0_0_56px] min-h-[56px]'
        : 'flex-[1_1_0] min-w-0'
      : isMobile
        ? 'flex-[0_0_56px] min-h-[56px]'
        : 'collapsed-panel';

  return (
    <button
      type="button"
      onClick={onActivate}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={isActive ? 'step' : undefined}
      className={`panel-button panel-container relative overflow-hidden rounded-[20px] bg-panel transition-[flex] duration-[550ms] ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none ${
        isActive ? 'cursor-default' : 'cursor-pointer'
      } ${flexClass}`}
    >
      <img
        src={panel.image}
        alt=""
        width={400}
        height={600}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-[filter,transform] duration-[550ms] ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none ${
          isActive ? 'scale-100' : 'scale-[1.06]'
        }`}
        style={{ filter: `saturate(${saturation})` }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[rgba(20,20,26,0)] from-30% to-[rgba(20,20,26,0.78)] pointer-events-none"
        aria-hidden="true"
      />

      <div
        className={`absolute text-white font-semibold whitespace-nowrap transition-opacity duration-300 pointer-events-none ${
          isActive ? 'opacity-0' : 'opacity-100'
        } ${
          isMobile
            ? 'left-4 top-0 h-14 flex items-center gap-2 text-sm'
            : `left-0 bottom-[22px] w-full flex justify-center gap-2 ${
                isLanding ? 'text-sm' : 'panel-vertical-label'
              }`
        }`}
      >
        <span className="opacity-60 font-mono text-[11px]">{num}</span>
        {label}
      </div>

      <div
        className={`absolute left-[clamp(18px,2.5vw,32px)] bottom-[clamp(18px,2.5vw,32px)] right-6 text-white transition-opacity duration-300 delay-200 pointer-events-none ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="font-mono text-xs opacity-70 tracking-[0.08em]">
          {num} / 14
        </div>
        <div className="text-[clamp(28px,3vw,44px)] font-semibold tracking-[-0.03em] leading-none mt-2">
          {label}
        </div>
      </div>
    </button>
  );
};

export default Panel;
