import type { VisualPlan } from '../../../lib/visualPlan';

export function Roadmap90({ phases }: { phases: VisualPlan['roadmap'] }) {
  return (
    <section className="strategy-section" aria-labelledby="roadmap-title">
      <div className="strategy-section-head">
        <div>
          <span className="section-eyebrow">Execution path</span>
          <h2 id="roadmap-title">Your 90-day roadmap</h2>
        </div>
      </div>
      <div className="roadmap-rail">
        {phases.map((phase, index) => (
          <article className="roadmap-phase" key={phase.range}>
            <div className="roadmap-marker"><span>{index + 1}</span></div>
            <div className="roadmap-range">{phase.range}</div>
            <h3>{phase.label}</h3>
            <p className="roadmap-goal">{phase.goal}</p>
            <ul>{phase.moves.map((move) => <li key={move}>{move}</li>)}</ul>
            <div className="roadmap-meta"><span>Focus</span>{phase.channels.join(' · ')}</div>
            <div className="roadmap-kpi"><span>Signal</span>{phase.kpi}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
