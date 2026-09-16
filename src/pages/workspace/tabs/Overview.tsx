import { useMemo } from 'react';
import { useAppState } from '../../../state/AppState';
import { buildVisualPlan } from '../../../lib/visualPlan';
import { GtmBlueprint } from '../components/GtmBlueprint';
import { PriorityActions } from '../components/PriorityActions';
import { MetricFocus } from '../components/MetricFocus';

export function Overview() {
  const { analysis } = useAppState();
  const plan = useMemo(() => analysis ? buildVisualPlan(analysis) : null, [analysis]);
  if (!analysis || !plan) return null;
  return (
    <div className="overview-page fade-in">
      <header className="strategy-hero">
        <div className="strategy-hero-copy">
          <span className="section-eyebrow">The strategy</span>
          <h2>{plan.headline}</h2>
          <p>{analysis.company.summary}</p>
        </div>
        <div className="strategy-score" aria-label={`Launch readiness score ${analysis.score.overall} out of 100`}>
          <span>Readiness</span><strong>{analysis.score.overall}</strong><small>/100</small>
          <div><i style={{ width: `${analysis.score.overall}%` }} /></div>
        </div>
      </header>
      <GtmBlueprint plan={plan} />
      <PriorityActions actions={plan.actions} />
      <MetricFocus metrics={plan.metrics} />
      <details className="strategy-reasoning">
        <summary>View the reasoning behind this direction</summary>
        <div className="reasoning-grid">
          <article><span>Opportunity</span><p>{analysis.recommendations.topOpportunity}</p></article>
          <article><span>Risk</span><p>{analysis.recommendations.biggestRisk}</p></article>
          <article><span>Next move</span><p>{analysis.recommendations.nextMove}</p></article>
        </div>
      </details>
    </div>
  );
}
