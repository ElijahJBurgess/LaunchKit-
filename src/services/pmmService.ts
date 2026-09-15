import type { BusinessInput } from '../types/business';
import type { PMMAnalysis } from '../types/pmm';
import { generateMockAnalysis } from '../data/mockPMMAnalysis';

const USE_MOCK_AI = import.meta.env.VITE_USE_MOCK_AI !== 'false';

/** Simulates network latency so the analysis screen has something to animate. */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateMockAnalysisWithLatency(input: BusinessInput): Promise<PMMAnalysis> {
  await wait(2200 + Math.random() * 1200);
  return generateMockAnalysis(input);
}

/**
 * Real AI path — not wired up yet. When VITE_USE_MOCK_AI=false, this is
 * expected to call the backend at /api/generate (see api/generate.js) with a
 * prompt asking for JSON matching the PMMAnalysis shape, and return the
 * parsed result. Left as a stub so the app never crashes without a key.
 */
async function generateRealAIAnalysis(_input: BusinessInput): Promise<PMMAnalysis> {
  throw new Error(
    'Real AI generation is not connected yet. Set VITE_USE_MOCK_AI=true in .env to use mock mode.'
  );
}

/**
 * Single entry point the UI calls to generate a strategy. The caller never
 * knows or cares whether the result came from the mock generator or the real
 * Anthropic API — both return the exact same PMMAnalysis shape.
 */
export async function generatePMMAnalysis(input: BusinessInput): Promise<PMMAnalysis> {
  if (USE_MOCK_AI) {
    return generateMockAnalysisWithLatency(input);
  }
  return generateRealAIAnalysis(input);
}

export function isMockMode(): boolean {
  return USE_MOCK_AI;
}
