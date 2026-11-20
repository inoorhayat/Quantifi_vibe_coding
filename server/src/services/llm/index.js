import * as anthropic from './anthropic.provider.js';

// Add an OpenAI provider here later without touching any controller.
const providers = { anthropic };

export const llm = providers[process.env.LLM_PROVIDER || 'anthropic'];