import React, { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-[var(--surface-pure,#FFFFFF)] border-t border-[var(--border-warm,#E8DFD5)] flex items-center gap-2"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <input
        type="text"
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your requirement or question..."
        className="flex-1 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[var(--background,#FAF7F2)] border border-[var(--border-warm,#E8DFD5)] text-base sm:text-sm text-[var(--ink-primary,#332924)] placeholder-[var(--ink-muted,#8A7C75)] focus-ring disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="w-11 h-11 rounded-xl bg-[var(--accent-coral,#C96A50)] hover:bg-[var(--accent-coral-hover,#B4583F)] text-white flex items-center justify-center shrink-0 shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus-ring"
        aria-label="Send message"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
