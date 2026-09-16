import type { PMMAnalysis } from '../types/pmm';

function concise(value: string, limit = 180): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= limit) return normalized;
  const slice = normalized.slice(0, limit - 1);
  const boundary = slice.lastIndexOf(' ');
  return `${slice.slice(0, boundary > limit * 0.65 ? boundary : limit - 1).trim()}…`;
}

export interface VisualPlan {
  headline: string;
  blueprint: {
    audience: string;
    problem: string;
    positioning: string;
    message: string;
    channels: string[];
    launch: string;
    success: string;
  };
  actions: Array<{ id: string; text: string; timing: 'Now' | 'Next' | 'Later' }>;
  roadmap: Array<{ range: string; label: string; goal: string; moves: string[]; channels: string[]; kpi: string }>;
  metrics: { primary: string; watch: string[] };
}

export function buildVisualPlan(analysis: PMMAnalysis): VisualPlan {
  const phases = [analysis.launch.preLaunch, analysis.launch.launch, analysis.launch.postLaunch];
  const ranges = ['Days 0–30', 'Days 31–60', 'Days 61–90'];
  const labels = ['Foundation', 'Launch', 'Learn + Grow'];
  return {
    headline: concise(analysis.positioning.valueProposition || analysis.positioning.statement, 150),
    blueprint: {
      audience: concise(analysis.icp.primary.name, 90),
      problem: concise(analysis.icp.primary.painPoints[0] || analysis.icp.primary.who, 150),
      positioning: concise(analysis.positioning.statement, 180),
      message: concise(analysis.messaging.hero, 130),
      channels: phases.flatMap((phase) => phase.channels).filter((channel, index, all) => all.indexOf(channel) === index).slice(0, 3),
      launch: concise(analysis.launch.launch.objective, 120),
      success: concise(analysis.launch.primaryKPI, 80),
    },
    actions: analysis.launch.checklist.slice(0, 7).map((text, index) => ({
      id: `action-${index}`,
      text: concise(text, 140),
      timing: index < 2 ? 'Now' : index < 5 ? 'Next' : 'Later',
    })),
    roadmap: phases.map((phase, index) => ({
      range: ranges[index],
      label: labels[index],
      goal: concise(phase.objective, 120),
      moves: phase.tactics.slice(0, 4).map((move) => concise(move, 100)),
      channels: phase.channels.slice(0, 3).map((channel) => concise(channel, 50)),
      kpi: concise(phase.kpi, 90),
    })),
    metrics: {
      primary: concise(analysis.launch.primaryKPI, 100),
      watch: analysis.launch.secondaryKPIs.slice(0, 3).map((metric) => concise(metric, 80)),
    },
  };
}
