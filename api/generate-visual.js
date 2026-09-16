import { generateVisual, isVisualRequest, VisualGenerationError } from '../lib/visuals.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { type, brief } = req.body || {};
  if (!isVisualRequest(type, brief)) {
    return res.status(400).json({ error: 'Provide a supported visual type and a complete, concise strategy brief.' });
  }
  try {
    return res.status(200).json({ imageUrl: await generateVisual(type, brief) });
  } catch (error) {
    return res.status(error instanceof VisualGenerationError ? error.status : 502).json({
      error: error instanceof VisualGenerationError ? error.message : 'Visual generation failed. Please try again.',
    });
  }
}
