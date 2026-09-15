// Production-style server: serves the Vite build output (run `npm run build`
// first) plus the /api/generate route. Only needed once VITE_USE_MOCK_AI=false
// and you're connecting the real Anthropic API — for local mock-mode dev, use
// `npm run dev` (Vite) instead, which needs no server at all.
require('dotenv').config();
const express = require('express');
const path = require('path');
const generateHandler = require('./api/generate');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

app.all('/api/generate', generateHandler);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LaunchKit (built) running at http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('Warning: ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.');
  }
});
