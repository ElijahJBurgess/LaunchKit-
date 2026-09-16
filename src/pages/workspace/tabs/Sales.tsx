import { useAppState } from '../../../state/AppState';
import { CopyButton } from '../../../components/CopyButton';
import { RegenerateButton } from '../../../components/RegenerateButton';

export function Sales() {
  const { analysis, regenerateSection } = useAppState();
  if (!analysis) return null;
  const { sales } = analysis;

  return (
    <div className="panel fade-in">
      <div className="panel-head">
        <h2>Sales</h2>
        <RegenerateButton onRegenerate={() => regenerateSection('sales')} />
      </div>

      <div className="sales-motion" aria-label="Sales motion">
        {[
          ['Target', analysis.icp.primary.name],
          ['Open', sales.discoveryQuestions[0]],
          ['Value', analysis.positioning.valueProposition],
          ['Reason', analysis.positioning.differentiation[0]],
          ['CTA', sales.pitch],
        ].map(([label, text], index) => <div className="sales-step" key={label}><span>{label}</span><strong>{text}</strong>{index < 4 && <i aria-hidden="true">→</i>}</div>)}
      </div>

      <details className="strategy-reasoning sales-details"><summary>View sales scripts and handling</summary><div className="sales-detail-body"><div className="section-block">
        <h3>Sales one-pager</h3>
        <div className="card">
          <div className="card-row-head">
            <strong>One-pager</strong>
            <CopyButton text={sales.onePager} />
          </div>
          {sales.onePager}
        </div>
      </div>

      <div className="section-block">
        <h3>Competitive battlecard</h3>
        <div className="card">
          <div className="card-row-head">
            <strong>Battlecard</strong>
            <CopyButton text={sales.battlecard} />
          </div>
          <div className="asset-body">{sales.battlecard}</div>
        </div>
      </div>

      <div className="section-block">
        <h3>Objections &amp; handling</h3>
        {sales.objections.map((obj, i) => (
          <div className="card" key={i} style={{ marginBottom: '0.6rem' }}>
            <div className="card-title" style={{ color: 'var(--bad)' }}>
              {obj}
            </div>
            <div>{sales.objectionHandling[i]}</div>
          </div>
        ))}
      </div>

      <div className="section-block">
        <h3>Discovery questions</h3>
        <ul className="opp-list">
          {sales.discoveryQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </div>

      <div className="section-block">
        <h3>Sales pitch</h3>
        <div className="card">
          <div className="card-row-head">
            <strong>Pitch</strong>
            <CopyButton text={sales.pitch} />
          </div>
          {sales.pitch}
        </div>
      </div></div></details>
    </div>
  );
}
