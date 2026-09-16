import type { BusinessInput } from '../types/business';
import type { PMMAnalysis } from '../types/pmm';
import { generateMockAnalysis } from '../data/mockPMMAnalysis';
import { validateAnalysisPayload } from '../../shared/pmmSchema.js';

const USE_MOCK_AI = import.meta.env.VITE_USE_MOCK_AI !== 'false';

async function requestAnalysis(input: BusinessInput, section?: keyof PMMAnalysis): Promise<Partial<PMMAnalysis>> {
  let response: Response;
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, ...(section ? { section } : {}) }),
      signal: AbortSignal.timeout(130_000),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw new Error('Strategy generation took too long. Please try again.');
    }
    throw new Error('Could not reach the generation server. Check that it is running and try again.');
  }
  const data = await response.json().catch(() => { throw new Error('The generation server returned an invalid response. Check that the backend is running.'); });
  if (!response.ok) throw new Error(typeof data?.error === 'string' ? data.error : 'Could not generate your strategy. Please try again.');
  if (!validateAnalysisPayload(data, input, section)) throw new Error('The generation server returned incomplete or low-quality strategy data. Please try again.');
  return data;
}

export async function generatePMMAnalysis(input: BusinessInput): Promise<PMMAnalysis> {
  if (USE_MOCK_AI) {
    await new Promise((resolve) => setTimeout(resolve, 2200 + Math.random() * 1200));
    return generateMockAnalysis(input);
  }
  return await requestAnalysis(input) as PMMAnalysis;
}

export async function regeneratePMMSection<K extends keyof PMMAnalysis>(input: BusinessInput, section: K): Promise<PMMAnalysis[K]> {
  if (USE_MOCK_AI) return generateMockAnalysis({ ...input, additionalContext: `${input.additionalContext || ''} ${Date.now()}` })[section];
  const result = await requestAnalysis(input, section);
  return result[section] as PMMAnalysis[K];
}

export function isMockMode(): boolean { return USE_MOCK_AI; }
