const { generateFromPrompt } = require('../lib/anthropic');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const prompt = req.body && req.body.prompt;
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Missing "prompt" string in request body' });
    return;
  }

  try {
    const result = await generateFromPrompt(prompt);
    res.status(200).json(result);
  } catch (err) {
    res.status(502).json({ error: (err && err.message) || 'Generation failed' });
  }
};
