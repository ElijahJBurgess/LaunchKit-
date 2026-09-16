import { useAppState } from '../../../state/AppState';
import { RegenerateButton } from '../../../components/RegenerateButton';

export function Competition() {
  const { analysis, regenerateSection } = useAppState();
  if (!analysis) return null;
  const { competition } = analysis;

  return (
    <div className="panel fade-in">
      <div className="panel-head">
        <h2>Competition</h2>
        <RegenerateButton onRegenerate={() => regenerateSection('competition')} />
      </div>

      <div className="competition-takeaway"><span className="section-eyebrow">Recommended alternative</span><h3>{competition.takeaway}</h3></div>
      <div className="section-block">
        <h3>Them → gap → your opportunity</h3>
        <table className="matrix">
          <thead>
            <tr>
              <th>Them</th>
              <th>Strength</th>
              <th>Gap</th>
              <th>You</th>
            </tr>
          </thead>
          <tbody>
            {competition.competitors.map((c, i) => (
              <tr key={i}>
                <td>
                  <strong>{c.name}</strong>
                </td>
                <td>{c.strength}</td>
                <td>{c.weakness}</td>
                <td>{c.opportunity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="strategy-reasoning section-block">
        <summary>View supporting SWOT</summary>
        <div className="swot-grid">
          <div className="swot-tile s">
            <h4>Strengths</h4>
            <ul>
              {competition.swot.strengths.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="swot-tile w">
            <h4>Weaknesses</h4>
            <ul>
              {competition.swot.weaknesses.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="swot-tile o">
            <h4>Opportunities</h4>
            <ul>
              {competition.swot.opportunities.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="swot-tile t">
            <h4>Threats</h4>
            <ul>
              {competition.swot.threats.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </details>
    </div>
  );
}
