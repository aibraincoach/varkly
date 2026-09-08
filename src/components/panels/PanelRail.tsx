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
  answeredCount: number;
  isShared: boolean;
  hasAnswers: boolean;
  onPanelActivate: (panelIndex: number) => void;
};

const PanelRail: React.FC<PanelRailProps> = ({
  active,
  isLanding,
  isMobile,
  panelGap,
  answers,
  answeredCount,
  isShared,
  hasAnswers,
  onPanelActivate,
}) => {
  const railStyle = isMobile ? undefined : { gap: `${panelGap}px` };

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
        const saturation = getPanelSaturation(index, answers, answeredCount, isShared);

        const handleActivate = () => {
          if (index === 13) {
            if (hasAnswers || isShared) {
              onPanelActivate(index);
            }
            return;
          }
          if (!isShared) {
            onPanelActivate(index);
          }
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
            onActivate={handleActivate}
          />
        );
      })}
    </section>
  );
};

export default PanelRail;
