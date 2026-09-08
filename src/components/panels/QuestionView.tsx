import React from 'react';
import type { Question } from '../../types';
import OptionButton from './OptionButton';

const ASIDE_BODY_HEIGHT = 'calc(4 * (4.35em + 27px) + 24px)';

type QuestionViewProps = {
  question: Question;
  panelTitle: string;
  questionNumber: number;
  isOptionSelected: (optionId: string) => boolean;
  onToggleOption: (optionId: string) => void;
};

const QuestionView: React.FC<QuestionViewProps> = ({
  question,
  panelTitle,
  questionNumber,
  isOptionSelected,
  onToggleOption,
}) => {
  const eyebrow = `Question ${String(questionNumber).padStart(2, '0')} / 13 · ${panelTitle}`;

  return (
    <>
      <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-3">
        {eyebrow}
      </div>
      <h1 className="mt-3.5 mb-[22px] min-h-[5.4em] text-[clamp(18px,1.5vw,23px)] leading-[1.35] font-semibold tracking-[-0.02em] text-pretty">
        {question.scenario}
      </h1>
      <div
        className="grid gap-2 content-stretch"
        style={{ height: ASIDE_BODY_HEIGHT }}
      >
        {question.options.map((option, index) => {
          const selected = isOptionSelected(option.id);
          return (
            <OptionButton
              key={option.id}
              text={option.text}
              selected={selected}
              mark={selected ? '✓' : String(index + 1)}
              onToggle={() => onToggleOption(option.id)}
            />
          );
        })}
      </div>
    </>
  );
};

export default QuestionView;
