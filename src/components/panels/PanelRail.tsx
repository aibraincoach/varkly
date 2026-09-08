import React from 'react';
import { panels } from '../../data/panels';
import Panel from './Panel';
import { getPanelSaturation } from './panelsLogic';

type PanelRailProps = {
  active: number;
  isLanding: boolean;
  isMobile: boolean;
  panelGap: number;
  answers: Record<number, string[]>;
  hasAnswers: boolean;
  canOpenResults: boolean;
  isShared: boolean;
  onPanelActivate: (panelIndex: number) => void;
};

const PanelRail: React.FC<PanelRailProps> = ({
  active,
  isLanding,
  isMobile,
  panelGap,
  answers,
  hasAnswers,
  canOpenResults,
  isShared,
  onPanelActivate,
}) => {
  const railStyle = isMobile
    ? undefined
    : ({
        gap: `${panelGap}px`,
        '--panel-gap': `${panelGap}px`,
        '--panel-gap-total': `${panelGap * 13}px`,
      } as React.CSSProperties);

  return (
    <section
      aria-label="Questions"
      className={
        isMobile
          ? 'flex flex-col gap-2'
          : 'flex h-[calc(100vh-120px)] min-h-[560px] max-h-[860px] min-w-0'
      }
      style={railStyle}
    >
      {panels.map((panel, index) => {
        const isActive = index === active;
        const isResults = index === 13;
        const saturation = getPanelSaturation(index, answers, hasAnswers, isShared);
        const disabled =
          isActive || (isShared && !isResults) || (isResults && !canOpenResults);

        const handleActivate = () => {
          if (disabled) return;
          onPanelActivate(index);
        };

        return (
          <Panel
            key={panel.id}
            panel={panel}
            panelIndex={index}
            isActive={isActive}
            isLanding={isLanding}
            isMobile={isMobile}
            saturation={saturation}
            disabled={disabled}
            onActivate={handleActivate}
          />
        );
      })}
    </section>
  );
};

export default PanelRail;
