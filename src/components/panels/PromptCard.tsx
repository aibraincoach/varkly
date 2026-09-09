import React from 'react';

type PromptCardProps = {
  title: string;
  prompt: string;
  copyLabel: string;
  onCopy: () => void;
  copied: boolean;
};

const PromptCard: React.FC<PromptCardProps> = ({
  title,
  prompt,
  copyLabel,
  onCopy,
  copied,
}) => {
  return (
    <div className="border-[1.5px] border-line rounded-xl bg-white flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#ececf0]">
        <span className="text-[13px] font-semibold">{title}</span>
        <button
          type="button"
          onClick={onCopy}
          className={`h-[30px] px-2.5 rounded-lg border-[1.5px] cursor-pointer font-sans text-xs font-semibold transition-all duration-200 ${
            copied
              ? 'border-ink bg-ink text-white'
              : 'border-line bg-white text-ink hover:border-ink'
          }`}
          aria-live="polite"
        >
          {copyLabel}
        </button>
      </div>
      <pre className="m-0 px-3.5 py-3 overflow-auto whitespace-pre-wrap font-sans text-[13px] leading-normal text-[#3a3a42] flex-1 min-h-0">
        {prompt}
      </pre>
    </div>
  );
};

export default PromptCard;
