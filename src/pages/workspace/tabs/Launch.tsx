import { useMemo } from 'react';
import { useAppState } from '../../../state/AppState';
import { buildVisualPlan } from '../../../lib/visualPlan';
import { Roadmap90 } from '../components/Roadmap90';
import { PriorityActions } from '../components/PriorityActions';
import { MetricFocus } from '../components/MetricFocus';

export function Launch() {
  const { analysis } = useAppState();
  const plan = useMemo(() => analysis ? buildVisualPlan(analysis) : null, [analysis]);
  if (!analysis || !plan) return null;
  return (
    <div className="launch-command fade-in">
      <header className="launch-intro">
        <span className="section-eyebrow">From strategy to motion</span>
        <h2>{analysis.launch.launch.objective}</h2>
        <p>Three focused phases, one clear sequence. Use the action board to keep momentum visible.</p>
      </header>
      <Roadmap90 phases={plan.roadmap} />
      <PriorityActions actions={plan.actions} />
      <MetricFocus metrics={plan.metrics} />
    </div>
  );
}
