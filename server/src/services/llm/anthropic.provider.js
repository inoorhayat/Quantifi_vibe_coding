import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Yields text chunks as the model generates them.
 * Pass an AbortSignal to cancel the upstream request.
 */
export async function* streamCompletion({ system, messages, signal }) {
  const stream = client.messages.stream(
    {
      model: process.env.LLM_MODEL || 'claude-sonnet-5-5',
      max_tokens: 1024,
      system,
      messages,
    },
    { signal }
  );

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text;
    }
  }
}