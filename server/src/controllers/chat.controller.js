import Conversation from '../models/Conversation.js';
import { llm } from '../services/llm/index.js';
import { buildSystemPrompt, TONES } from '../services/tone.js';

const MAX_HISTORY = 20;

const sendEvent = (res, data) => {
  if (!res.writableEnded && !res.destroyed) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
};

export async function streamChat(req, res, next) {
  // Cancels the LLM call if the browser closes the stream (Stop button)
  const abort = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) abort.abort();
  });

  try {
    const { conversationId, content, tone = 'professional', regenerate = false } = req.body;

    if (!TONES.includes(tone)) return res.status(400).json({ message: 'Invalid tone' });
    if (!regenerate && !content?.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const conversation = conversationId
      ? await Conversation.findById(conversationId)
      : new Conversation({ title: content.trim().slice(0, 40) });

    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    if (regenerate) {
      // Drop the last assistant reply so the previous user message is answered again
      if (conversation.messages.at(-1)?.role === 'assistant') conversation.messages.pop();
      if (conversation.messages.at(-1)?.role !== 'user') {
        return res.status(400).json({ message: 'Nothing to regenerate' });
      }
    } else {
      conversation.messages.push({ role: 'user', content: content.trim(), tone });
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    sendEvent(res, { type: 'meta', conversationId: conversation.id });

    // Build history, then drop leading assistant messages (Anthropic requires a user message first)
    const history = conversation.messages
      .slice(-MAX_HISTORY)
      .map(({ role, content }) => ({ role, content }));
    while (history[0]?.role === 'assistant') history.shift();

    let fullReply = '';
    try {
      for await (const chunk of llm.streamCompletion({
        system: buildSystemPrompt(tone),
        messages: history,
        signal: abort.signal,
      })) {
        fullReply += chunk;
        sendEvent(res, { type: 'delta', text: chunk });
      }
    } catch (err) {
      // An abort is expected when the user presses Stop; anything else is a real error
      if (!abort.signal.aborted) throw err;
    }

    // Save whatever was generated, including a partial reply after Stop
    if (fullReply) {
      conversation.messages.push({ role: 'assistant', content: fullReply, tone });
    }
    await conversation.save();

    sendEvent(res, { type: 'done', conversationId: conversation.id, title: conversation.title });
  } catch (err) {
    console.error('Stream error:', err);
    sendEvent(res, { type: 'error', message: 'Something went wrong. Please try again.' });
  } finally {
    res.end();
  }
}