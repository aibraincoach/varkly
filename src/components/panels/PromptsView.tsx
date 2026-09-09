import React from 'react';
import PromptCard from './PromptCard';
import { getPromptsEyebrow } from './panelsLogic';

type PromptsViewProps = {
  answeredCount: number;
  isShared: boolean;
  systemPrompt: string;
  conversationPrompt: string;
  sysCopyLabel: string;
  convCopyLabel: string;
  sysCopied: boolean;
  convCopied: boolean;
  onCopySystem: () => void;
  onCopyConversation: () => void;
};

const PromptsView: React.FC<PromptsViewProps> = ({
  answeredCount,
  isShared,
  systemPrompt,
  conversationPrompt,
  sysCopyLabel,
  convCopyLabel,
  sysCopied,
  convCopied,
  onCopySystem,
  onCopyConversation,
}) => {
  return (
    <>
      <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-3">
        {getPromptsEyebrow(isShared, answeredCount)}
      </div>
      <h1 className="mt-3.5 mb-[22px] min-h-[5.4em] text-[clamp(18px,1.5vw,23px)] leading-[1.35] font-semibold tracking-[-0.02em] text-pretty">
        <span className="block text-[clamp(28px,2.4vw,38px)] leading-[1.1] tracking-[-0.035em] mb-2.5">
          Teach your AI how you learn.
        </span>
        <span className="block font-normal text-[15px] leading-[1.55] text-muted-1 max-w-[46ch]">
          Two prompts built from your scores. The system prompt goes in custom instructions; the
          conversation prompt drops into any live chat.
        </span>
      </h1>
      <div className="panels-aside-body grid-rows-[1fr_auto] min-h-0">
        <PromptCard
          title="System prompt"
          prompt={systemPrompt}
          copyLabel={sysCopyLabel}
          onCopy={onCopySystem}
          copied={sysCopied}
        />
        <PromptCard
          title="Conversation prompt"
          prompt={conversationPrompt}
          copyLabel={convCopyLabel}
          onCopy={onCopyConversation}
          copied={convCopied}
        />
      </div>
    </>
  );
};

export default PromptsView;
