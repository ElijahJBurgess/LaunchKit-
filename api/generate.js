import { generateAnalysis, GenerationError } from '../lib/openai.js';
import { isSection } from '../shared/pmmSchema.js';

const required = ['businessName', 'description', 'targetAudience', 'customerProblem', 'businessGoal'];
const fields = [...required, 'website', 'differentiation', 'competitors', 'additionalContext'];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { input, section } = req.body || {};
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || required.some((key) => typeof input[key] !== 'string' || !input[key].trim())
    || fields.some((key) => input[key] !== undefined && (typeof input[key] !== 'string' || input[key].length > 10000))
    || (section !== undefined && !isSection(section))) {
    return res.status(400).json({ error: 'Provide valid business details and an optional analysis section. Each field must be at most 10,000 characters.' });
  }
  const business = Object.fromEntries(fields.filter((key) => input[key] !== undefined).map((key) => [key, input[key].trim()]));
  try {
    return res.status(200).json(await generateAnalysis(business, section));
  } catch (error) {
    return res.status(error instanceof GenerationError ? error.status : 502).json({
      error: error instanceof GenerationError ? error.message : 'Strategy generation failed. Please try again.',
    });
  }
}
