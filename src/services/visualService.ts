import type { PMMAnalysis } from '../types/pmm';
import { buildVisualPlan } from '../lib/visualPlan';

export type VisualType = 'strategy' | 'messaging' | 'launch' | 'sales' | 'marketing';
export type VisualBrief = Record<string, string | string[] | Array<Record<string, string | string[]>>>;

const USE_MOCK_AI = import.meta.env.VITE_USE_MOCK_AI !== 'false';

export function buildVisualBrief(type: VisualType, analysis: PMMAnalysis): VisualBrief {
  const plan = buildVisualPlan(analysis);
  const briefs: Record<VisualType, VisualBrief> = {
    strategy: { company: analysis.company.name, ...plan.blueprint },
    messaging: {
      positioning: analysis.positioning.statement,
      message: analysis.messaging.hero,
      pillars: analysis.messaging.pillars.slice(0, 4),
      featureBenefits: analysis.messaging.featureBenefits.slice(0, 3).map(({ feature, benefit }) => ({ feature, benefit })),
    },
    launch: {
      phases: plan.roadmap.map(({ range, label, goal, moves, channels, kpi }) => ({ range, label, goal, moves, channels, kpi })),
      primaryKpi: analysis.launch.primaryKPI,
    },
    sales: {
      target: analysis.sales.motion.target,
      openingQuestion: analysis.sales.motion.openingQuestion,
      value: analysis.sales.motion.value,
      reasonToBelieve: analysis.sales.motion.reasonToBelieve,
      objections: analysis.sales.objections.slice(0, 3).map(({ objection, response }) => ({ objection, response })),
      cta: analysis.sales.motion.callToAction,
    },
    marketing: {
      company: analysis.company.name,
      audience: analysis.icp.primary.name,
      message: analysis.messaging.hero,
      purpose: analysis.launch.launch.objective,
      cta: analysis.recommendations.nextMove,
    },
  };
  return briefs[type];
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] || character);
}

function compactMockText(value: string, limit = 82): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;
  const clipped = clean.slice(0, limit - 1);
  return `${clipped.slice(0, clipped.lastIndexOf(' ')).trim()}…`;
}

function mockVisual(type: VisualType, analysis: PMMAnalysis): string {
  const plan = buildVisualPlan(analysis);
  const title = ({ strategy: 'GTM Blueprint', messaging: 'Message System', launch: '90-Day Launch', sales: 'Sales Motion', marketing: 'Launch Creative' })[type];
  const nodes = type === 'strategy'
    ? [plan.blueprint.audience, plan.blueprint.positioning, plan.blueprint.message, plan.blueprint.success]
    : type === 'launch'
      ? plan.roadmap.map((phase) => `${phase.range} · ${phase.label}`)
      : [analysis.company.name, analysis.messaging.hero, analysis.positioning.category, analysis.launch.primaryKPI];
  const compactNodes = nodes.map((node) => compactMockText(node));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024"><rect width="1536" height="1024" fill="#f3f7ef"/><path d="M0 0h1536v110H0z" fill="#092f24"/><text x="86" y="72" font-family="Arial,sans-serif" font-size="32" font-weight="700" fill="#fff">LAUNCHKIT · ${escapeXml(title.toUpperCase())}</text><text x="86" y="220" font-family="Georgia,serif" font-size="72" font-weight="700" fill="#0b1713">${escapeXml(analysis.company.name)}</text><path d="M86 275h1364" stroke="#0b1713" stroke-width="3"/>${compactNodes.map((node, index) => `<g transform="translate(${86 + index * 355} 350)"><rect width="300" height="360" rx="26" fill="${index === 1 ? '#c7f34a' : '#fff'}" stroke="#bdd5c7" stroke-width="2"/><circle cx="42" cy="44" r="18" fill="#0b4736"/><text x="42" y="51" text-anchor="middle" font-family="Arial" font-size="17" font-weight="700" fill="#fff">${index + 1}</text><foreignObject x="32" y="90" width="236" height="225"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 25px Arial,sans-serif;line-height:1.25;color:#0b1713;overflow:hidden">${escapeXml(node)}</div></foreignObject></g>`).join('')}<text x="86" y="920" font-family="Arial,sans-serif" font-size="22" fill="#49645b">MOCK VISUAL · NO API CALL · ${escapeXml(plan.metrics.primary)}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function generateVisualAsset(type: VisualType, analysis: PMMAnalysis): Promise<string> {
  if (USE_MOCK_AI) return mockVisual(type, analysis);
  let response: Response;
  try {
    response = await fetch('/api/generate-visual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, brief: buildVisualBrief(type, analysis) }),
      signal: AbortSignal.timeout(190_000),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) throw new Error('Visual generation took too long. Try again when you’re ready.');
    throw new Error('Could not reach the image server. Check that it is running and try again.');
  }
  const data = await response.json().catch(() => { throw new Error('The image server returned an invalid response.'); });
  if (!response.ok) throw new Error(typeof data?.error === 'string' ? data.error : 'Could not generate this visual. Please try again.');
  if (typeof data?.imageUrl !== 'string' || !data.imageUrl.startsWith('data:image/')) throw new Error('The image server returned invalid image data.');
  return data.imageUrl;
}

export function visualsUseMockMode(): boolean { return USE_MOCK_AI; }
