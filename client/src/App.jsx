import { useChat } from './hooks/useChat';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import ToneToggle from './components/ToneToggle';

export default function App() {
  const chat = useChat();

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <Sidebar
        conversations={chat.conversations}
        activeId={chat.activeId}
        onSelect={chat.loadConversation}
        onNew={chat.newChat}
        onDelete={chat.removeChat}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 backdrop-blur dark:border-slate-800">
          <h1 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-lg font-bold text-transparent">
            AI Chat Assistant
          </h1>
          <ToneToggle value={chat.tone} onChange={chat.setTone} />
        </header>

        <ChatWindow
        messages={chat.messages}
        isStreaming={chat.isStreaming}
        onRegenerate={chat.regenerate}
        />
        <ChatInput onSend={chat.sendMessage} onStop={chat.stop} isStreaming={chat.isStreaming} />
      </main>
    </div>
  );
}