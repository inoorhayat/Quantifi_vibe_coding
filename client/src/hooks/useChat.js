import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchConversation,
  fetchConversations,
  removeConversation,
  streamChat,
} from '../api/chatApi';

export function useChat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [tone, setTone] = useState('professional');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);

  const refreshHistory = useCallback(() => {
    fetchConversations().then(setConversations).catch(console.error);
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const loadConversation = async (id) => {
    if (isStreaming) return;
    const conv = await fetchConversation(id);
    setActiveId(id);
    setMessages(conv.messages);
  };

  const newChat = () => {
    if (isStreaming) return;
    setActiveId(null);
    setMessages([]);
  };

  const removeChat = async (id) => {
    await removeConversation(id);
    if (id === activeId) newChat();
    refreshHistory();
  };

  // Shared streaming logic used by both sending and regenerating
  const runStream = async (payload) => {
    setIsStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChat(
        { ...payload, tone },
        {
          signal: controller.signal,
          onEvent: (evt) => {
            if (evt.type === 'meta') setActiveId(evt.conversationId);

            if (evt.type === 'delta') {
              setMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                copy[copy.length - 1] = { ...last, content: last.content + evt.text };
                return copy;
              });
            }

            if (evt.type === 'done') refreshHistory();
            if (evt.type === 'error') throw new Error(evt.message);
          },
        }
      );
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: 'assistant',
            content: 'Sorry, something went wrong. Please try again.',
            error: true,
          };
          return copy;
        });
      }
    } finally {
      setIsStreaming(false);
      setMessages((prev) => prev.map((m) => ({ ...m, streaming: false })));
    }
  };

  const sendMessage = (text) => {
    if (!text.trim() || isStreaming) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text },
      { role: 'assistant', content: '', streaming: true },
    ]);

    return runStream({ conversationId: activeId, content: text });
  };

  const regenerate = () => {
    if (isStreaming || !activeId || messages.length < 2) return;

    // Replace the last assistant reply with an empty placeholder
    setMessages((prev) => {
      const base = prev[prev.length - 1]?.role === 'assistant' ? prev.slice(0, -1) : prev;
      return [...base, { role: 'assistant', content: '', streaming: true }];
    });

    return runStream({ conversationId: activeId, regenerate: true });
  };

  const stop = () => abortRef.current?.abort();

  return {
    conversations,
    activeId,
    messages,
    tone,
    setTone,
    isStreaming,
    sendMessage,
    regenerate,
    stop,
    loadConversation,
    newChat,
    removeChat,
  };
}