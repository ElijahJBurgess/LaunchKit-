import { useAppState } from '../../../state/AppState';
import { CopyButton } from '../../../components/CopyButton';
import { RegenerateButton } from '../../../components/RegenerateButton';

export function Sales() {
  const { analysis, regenerateSection } = useAppState();
  if (!analysis) return null;
  const { sales } = analysis;
  const motion = [
    ['Target', sales.motion.target],
    ['Opening question', sales.motion.openingQuestion],
    ['Value', sales.motion.value],
    ['Reason to believe', sales.motion.reasonToBelieve],
    ['Call to action', sales.motion.callToAction],
  ];

  return (
    <div className="sales-page fade-in">
      <div className="sales-page-head">
        <div>
          <span className="section-eyebrow">Conversation architecture</span>
          <h2>Your sales motion</h2>
          <p>Lead with the customer’s reality, connect it to the value, then make the next step obvious.</p>
        </div>
        <RegenerateButton onRegenerate={() => regenerateSection('sales')} />
      </div>

      <div className="sales-motion" aria-label="Sales motion">
        {motion.map(([label, text], index) => (
          <article className={`sales-step sales-step-${index + 1}`} key={label}>
            <div className="sales-step-number">0{index + 1}</div>
            <div className="sales-step-copy">
              <span className="sales-step-label">{label}</span>
              <strong className="sales-step-value">{text}</strong>
            </div>
            {index < motion.length - 1 && <i aria-hidden="true">↓</i>}
          </article>
        ))}
      </div>

      <section className="sales-field-guide" aria-labelledby="sales-field-guide-title">
        <div className="sales-section-title">
          <span className="section-eyebrow">In the conversation</span>
          <h2 id="sales-field-guide-title">Your field guide</h2>
        </div>
        <div className="sales-guide-grid">
          <article className="sales-guide-panel">
            <h3>Discovery questions</h3>
            <ol className="sales-question-list">
              {sales.discoveryQuestions.map((question, index) => (
                <li key={question}><span>0{index + 1}</span>{question}</li>
              ))}
            </ol>
          </article>
          <article className="sales-guide-panel sales-objection-panel">
            <h3>Objections and responses</h3>
            <div className="sales-objection-list">
              {sales.objections.map(({ objection, response }, index) => (
                <details key={objection} open={index === 0}>
                  <summary>{objection}</summary>
                  <p>{response}</p>
                </details>
              ))}
            </div>
          </article>
        </div>
      </section>

      <details className="strategy-reasoning sales-details">
        <summary>Open the complete sales toolkit</summary>
        <div className="sales-detail-body">
          <div className="section-block">
            <h3>Sales one-pager</h3>
            <div className="card">
              <div className="card-row-head"><strong>One-pager</strong><CopyButton text={sales.onePager} /></div>
              {sales.onePager}
            </div>
          </div>
          <div className="section-block">
            <h3>Competitive battlecard</h3>
            <div className="card">
              <div className="card-row-head"><strong>Battlecard</strong><CopyButton text={sales.battlecard} /></div>
              <div className="asset-body">{sales.battlecard}</div>
            </div>
          </div>
          <div className="section-block">
            <h3>Sales pitch</h3>
            <div className="card">
              <div className="card-row-head"><strong>Pitch</strong><CopyButton text={sales.pitch} /></div>
              {sales.pitch}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
