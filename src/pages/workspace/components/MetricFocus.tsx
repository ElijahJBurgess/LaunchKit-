import type { VisualPlan } from '../../../lib/visualPlan';

export function MetricFocus({ metrics }: { metrics: VisualPlan['metrics'] }) {
  return (
    <section className="metric-focus" aria-labelledby="metric-title">
      <div className="metric-primary">
        <span className="section-eyebrow">North star</span>
        <h2 id="metric-title">{metrics.primary}</h2>
      </div>
      <div className="metric-watch">
        <span className="section-eyebrow">Watch</span>
        <div>{metrics.watch.map((metric) => <span key={metric}>{metric}</span>)}</div>
      </div>
    </section>
  );
}
