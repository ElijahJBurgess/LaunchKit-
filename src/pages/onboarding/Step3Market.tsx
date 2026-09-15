import type { BusinessInput } from '../../types/business';
import { BUSINESS_GOALS } from '../../types/business';

interface Props {
  value: BusinessInput;
  onChange: (patch: Partial<BusinessInput>) => void;
  onSubmit: () => void;
  onBack: () => void;
  canSubmit: boolean;
}

export function Step3Market({ value, onChange, onSubmit, onBack, canSubmit }: Props) {
  return (
    <div className="onboarding-card fade-in">
      <span className="onboarding-eyebrow">03 — Market</span>
      <h1 className="onboarding-heading">Now, give us some market context.</h1>
      <p className="onboarding-sub">Last step. Tell us what you're competing against and where you want to go.</p>

      <div className="field">
        <label htmlFor="ob-competitors">
          Competitors<span className="optional-tag">optional</span>
        </label>
        <input
          id="ob-competitors"
          type="text"
          placeholder="e.g. Slack, Notion, ClickUp"
          value={value.competitors}
          onChange={(e) => onChange({ competitors: e.target.value })}
          autoFocus
        />
      </div>

      <div className="field">
        <label>What's the primary business goal?</label>
        <div className="goal-grid">
          {BUSINESS_GOALS.map((goal) => (
            <button
              type="button"
              key={goal}
              className={`goal-card ${value.businessGoal === goal ? 'active' : ''}`}
              onClick={() => onChange({ businessGoal: goal })}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="ob-context">
          Additional Context<span className="optional-tag">optional</span>
        </label>
        <textarea
          id="ob-context"
          placeholder="Anything else your product marketer should know?"
          value={value.additionalContext}
          onChange={(e) => onChange({ additionalContext: e.target.value })}
        />
      </div>

      <div className="onboarding-nav">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={!canSubmit}>
          Build My Strategy →
        </button>
      </div>
    </div>
  );
}
