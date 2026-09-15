import { useAppState } from '../../../state/AppState';
import { RegenerateButton } from '../../../components/RegenerateButton';

export function Messaging() {
  const { analysis, regenerateSection } = useAppState();
  if (!analysis) return null;
  const { messaging, positioning } = analysis;

  return (
    <div className="panel fade-in">
      <div className="panel-head">
        <h2>Messaging</h2>
        <RegenerateButton onRegenerate={() => regenerateSection('messaging')} />
      </div>

      <div className="messaging-hierarchy">
        <div className="messaging-tier">
          <div className="messaging-tier-label">Core positioning</div>
          <div className="messaging-tier-body messaging-tier-quiet">{positioning.statement}</div>
        </div>
        <div className="messaging-arrow">↓</div>

        <div className="messaging-tier">
          <div className="messaging-tier-label">Hero message</div>
          <div className="messaging-tier-body messaging-hero">{messaging.hero}</div>
        </div>
        <div className="messaging-arrow">↓</div>

        <div className="messaging-tier">
          <div className="messaging-tier-label">Messaging pillars</div>
          <div className="pill-row">
            {messaging.pillars.map((p, i) => (
              <span className="pillar" key={i}>
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="messaging-arrow">↓</div>

        <div className="messaging-tier">
          <div className="messaging-tier-label">Proof points</div>
          <ul className="plain">
            {messaging.proofPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="messaging-arrow">↓</div>

        <div className="messaging-tier">
          <div className="messaging-tier-label">Feature → Benefit → Outcome</div>
          <div className="fbo-list">
            {messaging.featureBenefits.map((fb, i) => (
              <div className="fbo-row" key={i}>
                <div className="fbo-cell">
                  <div className="fbo-k">Feature</div>
                  {fb.feature}
                </div>
                <div className="fbo-connector">→</div>
                <div className="fbo-cell">
                  <div className="fbo-k">Benefit</div>
                  {fb.benefit}
                </div>
                <div className="fbo-connector">→</div>
                <div className="fbo-cell">
                  <div className="fbo-k">Outcome</div>
                  {fb.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-block" style={{ marginTop: '1.8rem' }}>
        <h3>Supporting messages</h3>
        <ul className="opp-list">
          {messaging.supportingMessages.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
