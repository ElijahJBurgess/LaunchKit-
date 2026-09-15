const STEPS = ['Product', 'Customer', 'Market'];

export function OnboardingProgress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="onboarding-progress">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < step ? 'done' : n === step ? 'active' : 'upcoming';
        return (
          <div className="onboarding-progress-step" key={label}>
            <span className={`onboarding-progress-label ${state}`}>
              <span className="onboarding-progress-num">{String(n).padStart(2, '0')}</span> {label}
            </span>
            {n < STEPS.length && <span className={`onboarding-progress-connector ${n < step ? 'done' : ''}`} />}
          </div>
        );
      })}
    </div>
  );
}
