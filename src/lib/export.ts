import type { PMMAnalysis } from '../types/pmm';

export function buildMarkdown(analysis: PMMAnalysis): string {
  const a = analysis;
  const lines: string[] = [];
  lines.push(`# ${a.company.name} — Product Marketing Strategy`);
  lines.push('');
  lines.push(a.company.summary);
  lines.push('');
  lines.push(`## Overview`);
  lines.push(`**Product Marketing Score:** ${a.score.overall}/100`);
  lines.push(`- Market Fit: ${a.score.marketFit}`);
  lines.push(`- Messaging: ${a.score.messaging}`);
  lines.push(`- Differentiation: ${a.score.differentiation}`);
  lines.push(`- ICP: ${a.score.icp}`);
  lines.push(`- Launch Readiness: ${a.score.launchReadiness}`);
  lines.push(`- Positioning: ${a.score.positioning}`);
  lines.push('');
  lines.push(`**Top Opportunity:** ${a.recommendations.topOpportunity}`);
  lines.push(`**Biggest Risk:** ${a.recommendations.biggestRisk}`);
  lines.push(`**Recommended Next Move:** ${a.recommendations.nextMove}`);
  lines.push('');
  lines.push(`## ICP`);
  lines.push(`### Primary: ${a.icp.primary.name}`);
  lines.push(a.icp.primary.who);
  lines.push(`- Pain points: ${a.icp.primary.painPoints.join('; ')}`);
  lines.push(`- Motivations: ${a.icp.primary.motivations.join('; ')}`);
  lines.push(`- Objections: ${a.icp.primary.objections.join('; ')}`);
  lines.push('');
  lines.push(`### Secondary: ${a.icp.secondary.name}`);
  lines.push(a.icp.secondary.who);
  lines.push('');
  lines.push(`## Positioning`);
  lines.push(`**Statement:** ${a.positioning.statement}`);
  lines.push(`**Value Proposition:** ${a.positioning.valueProposition}`);
  lines.push(`**Elevator Pitch:** ${a.positioning.elevatorPitch}`);
  lines.push(`**Why Now:** ${a.positioning.whyNow}`);
  lines.push('');
  lines.push(`## Messaging`);
  lines.push(`**Hero Message:** ${a.messaging.hero}`);
  lines.push(`Supporting messages:`);
  a.messaging.supportingMessages.forEach((m) => lines.push(`- ${m}`));
  lines.push('');
  lines.push(`## Competition`);
  a.competition.competitors.forEach((c) => {
    lines.push(`### ${c.name}`);
    lines.push(`- Strength: ${c.strength}`);
    lines.push(`- Weakness: ${c.weakness}`);
    lines.push(`- Our opportunity: ${c.opportunity}`);
  });
  lines.push(`**Takeaway:** ${a.competition.takeaway}`);
  lines.push('');
  lines.push(`## Launch Plan`);
  [a.launch.preLaunch, a.launch.launch, a.launch.postLaunch].forEach((phase) => {
    lines.push(`### ${phase.name}`);
    lines.push(`Objective: ${phase.objective}`);
    lines.push(`KPI: ${phase.kpi}`);
  });
  lines.push('');
  lines.push(`## Content Assets`);
  lines.push(`### Landing Page`);
  lines.push(a.content.landingPage);
  lines.push(`### Launch Email`);
  lines.push(a.content.launchEmail);
  lines.push('');
  lines.push(`## Sales`);
  lines.push(a.sales.onePager);
  lines.push('');
  return lines.join('\n');
}

export function downloadMarkdown(analysis: PMMAnalysis): void {
  const md = buildMarkdown(analysis);
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${analysis.company.name.replace(/\s+/g, '-').toLowerCase() || 'launchkit'}-strategy.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function copyFullStrategy(analysis: PMMAnalysis): Promise<void> {
  await navigator.clipboard.writeText(buildMarkdown(analysis));
}
