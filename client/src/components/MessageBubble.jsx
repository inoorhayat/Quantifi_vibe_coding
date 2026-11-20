import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group relative my-2">
      <button
        onClick={copy}
        className="absolute right-2 top-2 rounded-md bg-slate-700/80 p-1.5 text-slate-200 opacity-0 transition group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function MessageBubble({ role, content, streaming }) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm md:max-w-[70%] ${
          isUser
            ? 'rounded-br-md bg-gradient-to-br from-indigo-600 to-violet-600 text-white'
            : 'rounded-bl-md border border-slate-200/70 bg-white/90 text-slate-800 backdrop-blur dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-100'
        }`}
      >
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              pre: ({ children }) => <>{children}</>,
              code: ({ className, children }) => {
                const text = String(children).replace(/\n$/, '');
                const isBlock = /language-/.test(className || '') || text.includes('\n');
                return isBlock ? (
                  <CodeBlock>{text}</CodeBlock>
                ) : (
                  <code className="rounded bg-slate-200/70 px-1 dark:bg-slate-700">{text}</code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        {streaming && (
          <span className="ml-1 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-current align-middle" />
        )}
      </div>
    </motion.div>
  );
}