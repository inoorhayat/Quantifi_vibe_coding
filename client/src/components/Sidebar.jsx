import { Plus, Trash2, MessageSquare } from 'lucide-react';

export default function Sidebar({ conversations, activeId, onSelect, onNew, onDelete }) {
  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200/70 bg-white/50 p-4 backdrop-blur md:flex dark:border-slate-800 dark:bg-slate-900/50">
      <button
        onClick={onNew}
        className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow transition hover:shadow-lg"
      >
        <Plus size={16} /> New chat
      </button>

      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">History</p>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {conversations.map((c) => (
          <div
            key={c._id}
            className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              c._id === activeId
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <button onClick={() => onSelect(c._id)} className="flex flex-1 items-center gap-2 truncate text-left">
              <MessageSquare size={14} className="shrink-0" />
              <span className="truncate">{c.title}</span>
            </button>
            <button
              onClick={() => onDelete(c._id)}
              className="opacity-0 transition group-hover:opacity-100"
              aria-label="Delete conversation"
            >
              <Trash2 size={14} className="text-slate-400 hover:text-rose-500" />
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
}