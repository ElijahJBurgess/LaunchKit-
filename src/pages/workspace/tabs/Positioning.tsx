import { useAppState } from '../../../state/AppState';
import { CopyButton } from '../../../components/CopyButton';
import { RegenerateButton } from '../../../components/RegenerateButton';

export function Positioning() {
  const { analysis, regenerateSection } = useAppState();
  if (!analysis) return null;
  const p = analysis.positioning;

  return (
    <div className="panel fade-in">
      <div className="panel-head">
        <h2>Positioning</h2>
        <RegenerateButton onRegenerate={() => regenerateSection('positioning')} />
      </div>

      <div className="positioning-frame">
        <div className="positioning-context"><span>For</span><strong>{analysis.icp.primary.name}</strong></div>
        <div className="positioning-context"><span>Who need</span><strong>{analysis.icp.primary.painPoints[0]}</strong></div>
        <article className="positioning-anchor"><span>Recommended position</span><h3>{p.statement}</h3></article>
        <div className="positioning-because"><span>Because</span><strong>{p.differentiation[0]}</strong></div>
      </div>

      <details className="strategy-reasoning section-block">
        <summary>View full positioning rationale</summary>
        <div className="positioning-detail">
        <h3>Value proposition &amp; elevator pitch</h3>
        <div className="card" style={{ marginBottom: '0.7rem' }}>
          <div className="card-row-head">
            <strong>Value proposition</strong>
            <CopyButton text={p.valueProposition} />
          </div>
          {p.valueProposition}
        </div>
        <div className="card">
          <div className="card-row-head">
            <strong>Elevator pitch</strong>
            <CopyButton text={p.elevatorPitch} />
          </div>
          {p.elevatorPitch}
        </div>
        </div>

      <div className="positioning-detail">
        <h3>Category &amp; why now</h3>
        <div className="exec-grid">
          <div className="exec-tile">
            <div className="exec-k">Category</div>
            {p.category}
          </div>
          <div className="exec-tile">
            <div className="exec-k">Why now</div>
            {p.whyNow}
          </div>
        </div>
      </div>

      <div className="positioning-detail">
        <h3>Differentiation</h3>
        <ul className="opp-list">
          {p.differentiation.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div></details>
    </div>
  );
}
