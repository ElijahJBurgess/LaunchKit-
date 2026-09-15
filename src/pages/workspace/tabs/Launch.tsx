import { useAppState } from '../../../state/AppState';
import { useState } from 'react';
import type { LaunchPhase } from '../../../types/pmm';

function PhaseCard({ phase }: { phase: LaunchPhase }) {
  return (
    <div className="card launch-phase-card">
      <div className="card-title">{phase.name}</div>
      <p className="launch-objective">{phase.objective}</p>
      <div className="launch-phase-grid">
        <div>
          <div className="icp-k">Channels</div>
          <ul className="plain">
            {phase.channels.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="icp-k">Tactics</div>
          <ul className="plain">
            {phase.tactics.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="launch-kpi">
        <span className="chip">KPI</span> {phase.kpi}
      </div>
    </div>
  );
}

export function Launch() {
  const { analysis } = useAppState();
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  if (!analysis) return null;
  const { launch } = analysis;
  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="panel fade-in">
      <div className="section-block">
        <h3>Launch phases</h3>
        <div className="launch-phase-flow">
          <PhaseCard phase={launch.preLaunch} />
          <div className="messaging-arrow">↓</div>
          <PhaseCard phase={launch.launch} />
          <div className="messaging-arrow">↓</div>
          <PhaseCard phase={launch.postLaunch} />
        </div>
      </div>

      <div className="section-block">
        <h3>KPIs</h3>
        <div className="exec-grid">
          <div className="exec-tile">
            <div className="exec-k">Primary KPI</div>
            {launch.primaryKPI}
          </div>
          <div className="exec-tile">
            <div className="exec-k">Secondary KPIs</div>
            {launch.secondaryKPIs.join(', ')}
          </div>
        </div>
      </div>

      <div className="section-block">
        <h3>
          Launch checklist <span className="chip" style={{ marginLeft: '0.4rem' }}>{doneCount}/{launch.checklist.length}</span>
        </h3>
        <ul className="checklist">
          {launch.checklist.map((item, i) => (
            <li key={i} className={checked[i] ? 'checked' : ''}>
              <input
                type="checkbox"
                checked={!!checked[i]}
                onChange={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
