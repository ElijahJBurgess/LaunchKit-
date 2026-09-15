import type { BusinessInput } from '../../types/business';

interface Props {
  value: BusinessInput;
  onChange: (patch: Partial<BusinessInput>) => void;
  onNext: () => void;
  onBack: () => void;
  canContinue: boolean;
}

export function Step2Customer({ value, onChange, onNext, onBack, canContinue }: Props) {
  return (
    <div className="onboarding-card fade-in">
      <span className="onboarding-eyebrow">02 — Customer</span>
      <h1 className="onboarding-heading">Who is this for?</h1>
      <p className="onboarding-sub">Help us understand who needs this and why.</p>

      <div className="field">
        <label htmlFor="ob-audience">Target Audience</label>
        <input
          id="ob-audience"
          type="text"
          placeholder="e.g. Startup founders, product teams, creators"
          value={value.targetAudience}
          onChange={(e) => onChange({ targetAudience: e.target.value })}
          autoFocus
        />
      </div>

      <div className="field">
        <label htmlFor="ob-problem">What problem does it solve?</label>
        <textarea
          id="ob-problem"
          placeholder="What is frustrating or difficult for them today?"
          value={value.customerProblem}
          onChange={(e) => onChange({ customerProblem: e.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="ob-diff">
          Why would someone choose this product?<span className="optional-tag">optional</span>
        </label>
        <textarea
          id="ob-diff"
          placeholder="What makes it useful or different?"
          value={value.differentiation}
          onChange={(e) => onChange({ differentiation: e.target.value })}
        />
      </div>

      <div className="onboarding-nav">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="btn btn-primary" onClick={onNext} disabled={!canContinue}>
          Continue →
        </button>
      </div>
    </div>
  );
}
