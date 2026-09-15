import { useAppState } from '../../../state/AppState';
import { ScoreBar } from '../../../components/ScoreBar';

function scoreBadge(overall: number): { label: string; color: string; bg: string } {
  if (overall >= 80) return { label: 'Launch Ready', color: 'var(--good)', bg: 'var(--good-bg)' };
  if (overall >= 60) return { label: 'Needs Work', color: 'var(--warn)', bg: 'var(--warn-bg)' };
  return { label: 'Not Ready', color: 'var(--bad)', bg: 'var(--bad-bg)' };
}

export function Overview() {
  const { analysis } = useAppState();
  if (!analysis) return null;
  const { score, recommendations, company } = analysis;
  const badge = scoreBadge(score.overall);

  return (
    <div className="panel fade-in">
      <div className="score-card">
        <div className="score-top">
          <span className="score-label">Product Marketing Score</span>
          <span className="score-badge" style={{ color: badge.color, background: badge.bg }}>
            {badge.label}
          </span>
        </div>
        <div className="score-number">
          {score.overall}
          <span> / 100</span>
        </div>
        <div className="score-bar-track" style={{ marginTop: '0.7rem' }}>
          <div className="score-bar-fill" style={{ width: `${score.overall}%` }} />
        </div>
        <div className="subscore-grid">
          <ScoreBar label="Market fit" value={score.marketFit} />
          <ScoreBar label="Messaging" value={score.messaging} />
          <ScoreBar label="Differentiation" value={score.differentiation} />
          <ScoreBar label="ICP" value={score.icp} />
          <ScoreBar label="Launch readiness" value={score.launchReadiness} />
          <ScoreBar label="Positioning" value={score.positioning} />
        </div>
      </div>

      <div className="section-block">
        <h3>Executive Summary</h3>
        <p className="exec-summary">{company.summary}</p>
      </div>

      <div className="callout-stack">
        <div className="callout">
          <span className="callout-icon">💡</span>
          <div>
            <div className="callout-k">Top opportunity</div>
            <div className="callout-txt">{recommendations.topOpportunity}</div>
          </div>
        </div>
        <div className="callout">
          <span className="callout-icon">⚠️</span>
          <div>
            <div className="callout-k">Biggest risk</div>
            <div className="callout-txt">{recommendations.biggestRisk}</div>
          </div>
        </div>
        <div className="callout">
          <span className="callout-icon">🎯</span>
          <div>
            <div className="callout-k">Recommended next move</div>
            <div className="callout-txt">{recommendations.nextMove}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
