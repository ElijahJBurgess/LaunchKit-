import { schemaFor, validateAnalysisPayload } from '../shared/pmmSchema.js';
import { buildGenerationInstructions } from './generationInstructions.js';

export class GenerationError extends Error {
  constructor(message, status = 502) { super(message); this.status = status; }
}

export async function generateAnalysis(input, section) {
  // The same switch protects the browser and server. Adding a key alone cannot incur charges.
  if (process.env.VITE_USE_MOCK_AI !== 'false') {
    throw new GenerationError('Mock mode is enabled. Live AI generation is disabled.', 409);
  }
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new GenerationError('Set OPENAI_API_KEY on the server to enable OpenAI responses.', 503);

  let response;
  try {
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(120_000),
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || 'gpt-5-mini',
        store: false,
        max_output_tokens: 16000,
        instructions: buildGenerationInstructions(section),
        input: `${section ? `Generate a fresh ${section} section` : 'Generate the complete strategy'} for this business:\n${JSON.stringify(input)}`,
        text: { format: { type: 'json_schema', name: 'launchkit_analysis', strict: true, schema: schemaFor(section) } },
      }),
    });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') throw new GenerationError('OpenAI took too long to respond. Please try again.', 504);
    throw new GenerationError('Could not reach OpenAI. Please try again.');
  }
  if (!response.ok) {
    if (response.status === 401) throw new GenerationError('OpenAI rejected the API key. Check the server configuration.', 503);
    if (response.status === 429) throw new GenerationError('OpenAI usage or rate limit reached. Check API billing and limits, then try again.', 429);
    throw new GenerationError('OpenAI could not generate a strategy. Check the configured model and try again.');
  }
  let data;
  try { data = await response.json(); } catch { throw new GenerationError('OpenAI returned an invalid response. Please try again.'); }
  if (data.status !== 'completed') throw new GenerationError('OpenAI did not finish the strategy. Please try again.');
  const content = (data.output || []).filter((item) => item.type === 'message').flatMap((item) => item.content || []);
  if (content.some((item) => item.type === 'refusal')) throw new GenerationError('OpenAI could not fulfill this request. Please revise the business details.', 422);
  let result;
  try { result = JSON.parse(content.filter((item) => item.type === 'output_text').map((item) => item.text).join('')); }
  catch { throw new GenerationError('OpenAI returned invalid strategy data. Please try again.'); }
  if (!validateAnalysisPayload(result, input, section)) throw new GenerationError('OpenAI returned incomplete or low-quality strategy data. Please try again.');
  return result;
}
