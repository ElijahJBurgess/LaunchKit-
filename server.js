import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import generateHandler from './api/generate.js';

const directory = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '128kb' }));
app.all('/api/generate', generateHandler);
app.use(express.static(path.join(directory, 'dist')));
app.get('*', (_req, res) => res.sendFile(path.join(directory, 'dist', 'index.html')));
app.use((error, _req, res, _next) => {
  res.status(error.status === 413 ? 413 : 400).json({ error: 'Invalid or oversized request body.' });
});

const port = process.env.PORT || 3000;
// Local use by default; public hosting needs authentication and usage controls.
const host = process.env.HOST || '127.0.0.1';
app.listen(port, host, () => {
  console.log(`LaunchKit running at http://${host}:${port}`);
  if (process.env.VITE_USE_MOCK_AI !== 'false') console.log('Mock mode enabled; OpenAI calls are disabled.');
  else if (!process.env.OPENAI_API_KEY) console.warn('Set OPENAI_API_KEY in .env before using live AI.');
});
