const TONE_INSTRUCTIONS = {
  professional: 'Respond in a formal, precise, well-structured manner.',
  casual: 'Respond in a friendly, relaxed, conversational tone.',
  concise: 'Be as brief as possible. Use short sentences and no filler.',
};

export const TONES = Object.keys(TONE_INSTRUCTIONS);

export const buildSystemPrompt = (tone = 'professional') =>
  `You are a helpful AI assistant. ${TONE_INSTRUCTIONS[tone] ?? TONE_INSTRUCTIONS.professional}`;