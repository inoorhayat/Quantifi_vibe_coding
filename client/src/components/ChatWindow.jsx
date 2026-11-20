import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages, isStreaming, onRegenerate }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth' });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-4 text-5xl">✨</div>
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">How can I help today?</h2>
        <p className="mt-2 text-sm text-slate-500">Pick a tone above, then ask anything.</p>
      </div>
    );
  }

  const lastMessage = messages[messages.length - 1];
  const showRegenerate = !isStreaming && lastMessage.role === 'assistant' && !lastMessage.error;

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6 md:px-10">
      <AnimatePresence initial={false}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} {...msg} />
        ))}
      </AnimatePresence>

      {showRegenerate && (
        <div className="flex justify-start">
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <RotateCw size={12} /> Regenerate
          </button>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}