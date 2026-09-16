import type { BusinessInput } from '../../types/business';

interface Props {
  value: BusinessInput;
  onChange: (patch: Partial<BusinessInput>) => void;
  onNext: () => void;
  onTryExample: () => void;
  canContinue: boolean;
}

export function Step1Product({ value, onChange, onNext, onTryExample, canContinue }: Props) {
  return (
    <div className="onboarding-card fade-in">
      <span className="onboarding-eyebrow">01 — Product</span>
      <h1 className="onboarding-heading">First, tell us about the product.</h1>
      <p className="onboarding-sub">Give LaunchKit the basics. We'll figure out the strategy later.</p>

      <div className="field">
        <label htmlFor="ob-name">Business / Product Name</label>
        <input
          id="ob-name"
          type="text"
          placeholder="e.g. Notion"
          value={value.businessName}
          onChange={(e) => onChange({ businessName: e.target.value })}
          autoFocus
        />
      </div>

      <div className="field">
        <label htmlFor="ob-website">
          Website<span className="optional-tag">optional</span>
        </label>
        <input
          id="ob-website"
          type="text"
          placeholder="https://..."
          value={value.website}
          onChange={(e) => onChange({ website: e.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="ob-description">What does the product do?</label>
        <textarea
          id="ob-description"
          placeholder="Describe the product in 1-2 sentences."
          value={value.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      <div className="onboarding-nav onboarding-nav-single">
        <button type="button" className="btn btn-primary" onClick={onNext} disabled={!canContinue}>
          Continue →
        </button>
      </div>

      <button type="button" className="example-link" onClick={onTryExample}>
        Try an example →
      </button>
      <span className="example-link-note">Explore LaunchKit with a hypothetical Spotify product.</span>
    </div>
  );
}
