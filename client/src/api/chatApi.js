const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export const fetchConversations = () =>
  fetch(`${BASE}/conversations`).then((r) => r.json());

export const fetchConversation = (id) =>
  fetch(`${BASE}/conversations/${id}`).then((r) => r.json());

export const removeConversation = (id) =>
  fetch(`${BASE}/conversations/${id}`, { method: 'DELETE' });

/**
 * Reads the SSE stream from the backend and calls onEvent for each event.
 */
export async function streamChat(payload, { onEvent, signal }) {
  const res = await fetch(`${BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) throw new Error('Request failed');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop(); // keep any incomplete event for the next chunk

    for (const evt of events) {
      if (evt.startsWith('data: ')) onEvent(JSON.parse(evt.slice(6)));
    }
  }
}