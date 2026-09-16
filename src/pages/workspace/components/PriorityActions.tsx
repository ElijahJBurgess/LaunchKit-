import { useState } from 'react';
import type { VisualPlan } from '../../../lib/visualPlan';

export function PriorityActions({ actions }: { actions: VisualPlan['actions'] }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const doneCount = actions.filter((action) => done[action.id]).length;
  const groups = ['Now', 'Next', 'Later'] as const;
  return (
    <section className="strategy-section priority-board" aria-labelledby="priority-title">
      <div className="strategy-section-head">
        <div>
          <span className="section-eyebrow">Action board</span>
          <h2 id="priority-title">Do these next</h2>
        </div>
        <span className="completion-count"><b>{doneCount}</b> / {actions.length} complete</span>
      </div>
      <div className="priority-groups">
        {groups.map((group) => (
          <div className={`priority-group priority-${group.toLowerCase()}`} key={group}>
            <div className="priority-group-label"><span />{group}</div>
            {actions.filter((action) => action.timing === group).map((action) => (
              <label className={`priority-action ${done[action.id] ? 'is-done' : ''}`} key={action.id}>
                <input
                  type="checkbox"
                  checked={!!done[action.id]}
                  onChange={() => setDone((current) => ({ ...current, [action.id]: !current[action.id] }))}
                />
                <span className="action-check" aria-hidden="true">{done[action.id] ? '✓' : ''}</span>
                <span>{action.text}</span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
