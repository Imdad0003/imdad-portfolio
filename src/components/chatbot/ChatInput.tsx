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
      className="p-3 bg-[rgba(20,8,26,0.85)] border-t border-[#F6DBC0]/15 flex items-center gap-2"
    >
      <input
        type="text"
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your requirement or question..."
        className="flex-1 px-3.5 py-2.5 rounded-xl bg-[rgba(39,17,46,0.7)] border border-[#F6DBC0]/15 text-base sm:text-sm text-[#F8F4E9] placeholder-[#bba89d]/60 focus-ring disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#F8F4E9] to-[#F6DBC0] text-[#220d29] flex items-center justify-center shrink-0 shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus-ring"
        aria-label="Send message"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
