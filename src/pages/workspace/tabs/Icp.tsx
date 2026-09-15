import { useAppState } from '../../../state/AppState';
import type { ICP } from '../../../types/pmm';

function PersonaCard({ persona }: { persona: ICP }) {
  return (
    <div className="card icp-card">
      <div className="card-title">{persona.name}</div>
      <p className="icp-who">{persona.who}</p>
      <div className="icp-grid">
        <div>
          <div className="icp-k">Jobs to be done</div>
          <ul className="plain">
            {persona.jobsToBeDone.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="icp-k">Pain points</div>
          <ul className="plain">
            {persona.painPoints.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="icp-k">Motivations</div>
          <ul className="plain">
            {persona.motivations.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="icp-k">Buying triggers</div>
          <ul className="plain">
            {persona.buyingTriggers.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="icp-k">Objections</div>
          <ul className="plain">
            {persona.objections.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="icp-k">What they care about</div>
          <ul className="plain">
            {persona.whatTheyCareAbout.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function Icp() {
  const { analysis } = useAppState();
  if (!analysis) return null;
  return (
    <div className="panel fade-in">
      <div className="section-block">
        <h3>Primary ICP</h3>
        <PersonaCard persona={analysis.icp.primary} />
      </div>
      <div className="section-block">
        <h3>Secondary ICP</h3>
        <PersonaCard persona={analysis.icp.secondary} />
      </div>
    </div>
  );
}
