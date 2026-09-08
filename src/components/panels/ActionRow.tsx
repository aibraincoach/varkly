import React from 'react';

type ActionRowProps = {
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  nextLabel: string;
  skipLabel: string;
  previousDisabled: boolean;
  showSkip: boolean;
};

const ActionRow: React.FC<ActionRowProps> = ({
  onPrevious,
  onNext,
  onSkip,
  nextLabel,
  skipLabel,
  previousDisabled,
  showSkip,
}) => {
  return (
    <div className="flex items-center gap-2 mt-7">
      <button
        type="button"
        onClick={onPrevious}
        disabled={previousDisabled}
        aria-label="Previous"
        className="h-11 w-11 rounded-xl border-[1.5px] border-line bg-white cursor-pointer text-lg text-ink flex items-center justify-center disabled:opacity-40 hover:border-ink"
      >
        ←
      </button>
      <button
        type="button"
        onClick={onNext}
        className="h-11 px-5 rounded-xl border-none bg-ink text-white cursor-pointer font-sans text-sm font-semibold flex items-center gap-2 hover:bg-[#39393f]"
      >
        {nextLabel} <span className="opacity-60">→</span>
      </button>
      {showSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="h-11 px-3.5 rounded-xl border-none bg-transparent text-muted-2 cursor-pointer font-sans text-[13px] hover:text-ink"
        >
          {skipLabel}
        </button>
      )}
    </div>
  );
};

export default ActionRow;
