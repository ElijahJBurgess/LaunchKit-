export const VISUAL_TYPES = ['strategy', 'messaging', 'launch', 'sales', 'marketing'];

export class VisualGenerationError extends Error {
  constructor(message, status = 502) { super(message); this.status = status; }
}

const requiredFields = {
  strategy: ['company', 'audience', 'problem', 'positioning', 'message', 'channels', 'launch', 'success'],
  messaging: ['positioning', 'message', 'pillars', 'featureBenefits'],
  launch: ['phases', 'primaryKpi'],
  sales: ['target', 'pain', 'value', 'objections', 'cta'],
  marketing: ['company', 'audience', 'message', 'purpose', 'cta'],
};

function isBriefValue(value) {
  return typeof value === 'string'
    ? value.trim().length > 0 && value.length <= 2_000
    : Array.isArray(value) && value.length <= 12 && value.every((item) => (
      typeof item === 'string'
        ? item.trim().length > 0 && item.length <= 1_000
        : item && typeof item === 'object' && !Array.isArray(item)
          && Object.keys(item).length <= 8
          && Object.values(item).every((nested) => typeof nested === 'string'
            ? nested.trim().length > 0 && nested.length <= 1_000
            : Array.isArray(nested) && nested.length <= 4 && nested.every((entry) => typeof entry === 'string' && entry.length <= 500))
    ));
}

export function isVisualRequest(type, brief) {
  return VISUAL_TYPES.includes(type)
    && brief && typeof brief === 'object' && !Array.isArray(brief)
    && requiredFields[type].every((field) => Object.hasOwn(brief, field) && isBriefValue(brief[field]));
}

function titleFor(type) {
  return ({ strategy: 'GTM strategy', messaging: 'messaging system', launch: '90-day launch roadmap', sales: 'sales motion', marketing: 'launch campaign asset' })[type];
}

export function buildVisualPrompt(type, brief) {
  return `Create a landscape premium editorial ${titleFor(type)} for LaunchKit. Use only this validated strategy brief as source material: ${JSON.stringify(brief)}. Visual language: deep forest green, bright LaunchKit green, white, black, and pale mint only; crisp geometric information design; strong hierarchy; clean shapes, paths, connectors, and stages; generous whitespace; no people, photography, stock-photo look, fantasy, logos, testimonials, awards, customer quotes, or invented metrics. Keep text extremely minimal and readable. Do not add facts or claims that are absent from the brief. The composition should feel like an executive strategy deck and polished portfolio piece.`;
}

export async function generateVisual(type, brief) {
  if (process.env.VITE_USE_MOCK_AI !== 'false') throw new VisualGenerationError('Mock mode is enabled. Live image generation is disabled.', 409);
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new VisualGenerationError('Set OPENAI_API_KEY on the server to generate visuals.', 503);
  let response;
  try {
    response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(180_000),
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL?.trim() || 'gpt-image-2',
        prompt: buildVisualPrompt(type, brief),
        n: 1,
        size: '1536x1024',
        quality: 'medium',
        output_format: 'webp',
      }),
    });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') throw new VisualGenerationError('Image generation took too long. Please try again.', 504);
    throw new VisualGenerationError('Could not reach OpenAI image generation. Please try again.');
  }
  if (!response.ok) {
    if (response.status === 401) throw new VisualGenerationError('OpenAI rejected the API key. Check the server configuration.', 503);
    if (response.status === 429) throw new VisualGenerationError('OpenAI image usage or rate limit reached. Check API billing and limits, then try again.', 429);
    throw new VisualGenerationError('OpenAI could not create this visual. Please try again.');
  }
  let data;
  try { data = await response.json(); } catch { throw new VisualGenerationError('OpenAI returned invalid image data. Please try again.'); }
  const base64 = data.data?.[0]?.b64_json;
  if (typeof base64 !== 'string' || !base64) throw new VisualGenerationError('OpenAI returned no image. Please try again.');
  const format = ['png', 'jpeg', 'webp'].includes(data.output_format) ? data.output_format : 'webp';
  return `data:image/${format};base64,${base64}`;
}
