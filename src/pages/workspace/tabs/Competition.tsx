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

      <div className="section-block">
        <h3>Competitive matrix</h3>
        <table className="matrix">
          <thead>
            <tr>
              <th>Competitor</th>
              <th>Strength</th>
              <th>Weakness</th>
              <th>Our opportunity</th>
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
        <div className="card">
          <strong>Competitive takeaway:</strong> {competition.takeaway}
        </div>
      </div>

      <div className="section-block">
        <h3>SWOT</h3>
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
      </div>
    </div>
  );
}
