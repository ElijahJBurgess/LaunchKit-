import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../state/AppState';
import './Analysis.css';

const STEPS = [
  'Understanding your product',
  'Identifying your ideal customers',
  'Analyzing competitors',
  'Finding positioning opportunities',
  'Building your messaging',
  'Creating your go-to-market strategy',
];

type StepState = 'waiting' | 'analyzing' | 'complete';

export function Analysis() {
  const { businessInput, analysis, analysisError, runAnalysis } = useAppState();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!businessInput.businessName) {
      navigate('/onboarding', { replace: true });
      return;
    }
    if (started.current) return;
    started.current = true;

    runAnalysis();

    const interval = setInterval(() => {
      setActiveIndex((i) => Math.min(i + 1, STEPS.length));
    }, 480);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (analysis) {
      setActiveIndex(STEPS.length);
      const t = setTimeout(() => navigate('/workspace'), 500);
      return () => clearTimeout(t);
    }
  }, [analysis, navigate]);

  function stepState(i: number): StepState {
    if (i < activeIndex) return 'complete';
    if (i === activeIndex) return 'analyzing';
    return 'waiting';
  }

  const pct = Math.min(96, 8 + (activeIndex / STEPS.length) * 88);

  return (
    <div className="analysis-screen">
      <div className="analysis-card fade-in">
        <h2>Analyzing {businessInput.businessName || 'your business'}…</h2>
        <p className="analysis-sub">LaunchKit is building your product marketing strategy.</p>

        {analysisError ? (
          <div className="error-note">
            {analysisError}
            <div style={{ marginTop: '0.8rem' }}>
              <button className="btn btn-sm btn-ghost" onClick={() => navigate('/onboarding')}>
                Back to onboarding
              </button>
            </div>
          </div>
        ) : (
          <>
            <ul className="analysis-step-list">
              {STEPS.map((label, i) => {
                const state = stepState(i);
                return (
                  <li key={label} className={state}>
                    <span className="analysis-dot">
                      {state === 'complete' ? '✓' : state === 'analyzing' ? '◉' : '○'}
                    </span>
                    {label}
                  </li>
                );
              })}
            </ul>
            <div className="analysis-progress-track">
              <div className="analysis-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="analysis-sub2">This usually takes a few seconds.</div>
          </>
        )}
      </div>
    </div>
  );
}
