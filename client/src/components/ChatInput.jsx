import { useState } from 'react';
import { Send, Square } from 'lucide-react';

export default function ChatInput({ onSend, onStop, isStreaming }) {
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim() || isStreaming) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-slate-200/70 bg-white/60 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400 dark:border-slate-700 dark:bg-slate-800">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message the assistant..."
          className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none dark:text-slate-100"
        />
        {isStreaming ? (
          <button
            onClick={onStop}
            className="rounded-xl bg-rose-500 p-2.5 text-white transition hover:bg-rose-600"
            aria-label="Stop generating"
          >
            <Square size={16} />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="rounded-xl bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-700 disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        )}
      </div>
    </div>
  );
}