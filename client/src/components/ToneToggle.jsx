import { motion } from 'framer-motion';

const TONES = ['professional', 'casual', 'concise'];

export default function ToneToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-full bg-slate-200/70 p-1 dark:bg-slate-800">
      {TONES.map((tone) => (
        <button
          key={tone}
          onClick={() => onChange(tone)}
          className={`relative rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
            value === tone ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {value === tone && (
            <motion.span
              layoutId="tone-pill"
              className="absolute inset-0 -z-10 rounded-full bg-white shadow dark:bg-slate-700"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          {tone}
        </button>
      ))}
    </div>
  );
}