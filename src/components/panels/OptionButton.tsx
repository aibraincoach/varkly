import React from 'react';

type OptionButtonProps = {
  text: string;
  selected: boolean;
  mark: string;
  onToggle: () => void;
};

const OptionButton: React.FC<OptionButtonProps> = ({ text, selected, mark, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`flex items-start gap-3 text-left px-3.5 py-3 min-h-[calc(2.9em+27px)] rounded-xl border-[1.5px] cursor-pointer font-sans text-sm leading-[1.45] transition-all duration-200 ${
        selected
          ? 'border-ink bg-ink text-on-ink'
          : 'border-line bg-surface text-ink hover:border-ink'
      }`}
    >
      <span
        className={`flex-none w-[22px] h-[22px] rounded-md flex items-center justify-center font-mono text-[11px] mt-px ${
          selected ? 'bg-on-ink text-ink' : 'bg-box text-muted-2'
        }`}
      >
        {mark}
      </span>
      <span className="flex-1">{text}</span>
    </button>
  );
};

export default OptionButton;
