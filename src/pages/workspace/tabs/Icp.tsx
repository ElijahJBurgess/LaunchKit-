import { useAppState } from '../../../state/AppState';
import type { ICP } from '../../../types/pmm';

function PersonaCard({ persona }: { persona: ICP }) {
  return (
    <div className="card icp-card">
      <div className="persona-head"><span>Audience</span><h3>{persona.name}</h3></div>
      <div className="persona-flow" aria-label={`Decision path for ${persona.name}`}>
        <article><span>Who they are</span><strong>{persona.who}</strong></article>
        <i aria-hidden="true">↓</i>
        <article><span>What they want</span><strong>{persona.jobsToBeDone[0]}</strong></article>
        <i aria-hidden="true">↕</i>
        <article><span>What blocks them</span><strong>{persona.painPoints[0]}</strong></article>
        <i aria-hidden="true">↓</i>
        <article className="persona-buy"><span>Why they buy</span><strong>{persona.buyingTriggers[0]}</strong></article>
      </div>
      <details className="persona-details"><summary>View supporting detail</summary><div className="icp-grid">
        {[['Motivations', persona.motivations], ['Objections', persona.objections], ['What they care about', persona.whatTheyCareAbout]].map(([label, items]) => <div key={label as string}><div className="icp-k">{label as string}</div><ul className="plain">{(items as string[]).map((x, i) => <li key={i}>{x}</li>)}</ul></div>)}
      </div></details>
    </div>
  );
}

export function Icp() {
  const { analysis } = useAppState();
  if (!analysis) return null;
  return (
    <div className="panel fade-in">
      <header className="compact-page-head"><span className="section-eyebrow">Audience decision map</span><h2>Know who moves—and why.</h2></header>
      <div className="section-block">
        <h3>Primary audience</h3>
        <PersonaCard persona={analysis.icp.primary} />
      </div>
      <div className="section-block">
        <h3>Secondary audience</h3>
        <PersonaCard persona={analysis.icp.secondary} />
      </div>
    </div>
  );
}
