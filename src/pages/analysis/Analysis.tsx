import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../state/AppState';
import { activeStepAt, loadingCopyAt, progressAt } from '../../lib/loadingProgress';
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
  const [elapsed, setElapsed] = useState(0);
  const [complete, setComplete] = useState(false);
  const started = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!businessInput.businessName) {
      navigate('/onboarding', { replace: true });
      return;
    }
    if (started.current) return;
    started.current = true;

    const startedAt = Date.now();
    runAnalysis();
    timer.current = setInterval(() => setElapsed(Date.now() - startedAt), 500);
    return () => { if (timer.current) clearInterval(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (analysis) {
      if (timer.current) clearInterval(timer.current);
      setComplete(true);
      const t = setTimeout(() => navigate('/workspace'), 850);
      return () => clearTimeout(t);
    }
  }, [analysis, navigate]);

  useEffect(() => {
    if (analysisError && timer.current) clearInterval(timer.current);
  }, [analysisError]);

  function stepState(i: number): StepState {
    if (complete) return 'complete';
    const activeIndex = activeStepAt(elapsed, STEPS.length);
    if (i < activeIndex) return 'complete';
    if (i === activeIndex) return 'analyzing';
    return 'waiting';
  }

  const pct = complete ? 100 : progressAt(elapsed);

  return (
    <div className="analysis-screen">
      <div className="analysis-card fade-in">
        <div className="analysis-orbit" aria-hidden="true"><span /><span /><span /></div>
        <span className="analysis-eyebrow">LaunchKit strategy engine</span>
        <h2>{complete ? 'Your strategy is ready.' : `Analyzing ${businessInput.businessName || 'your business'}…`}</h2>
        <p className="analysis-sub">{complete ? 'Opening your strategic command center…' : loadingCopyAt(elapsed)}</p>

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
            <div className="analysis-progress-meta"><span>{complete ? 'Complete' : 'Strategy in progress'}</span><b>{Math.round(pct)}%</b></div>
            <div className="analysis-progress-track" aria-label={`Strategy generation ${Math.round(pct)} percent complete`}>
              <div className="analysis-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="analysis-sub2">Usually takes about 1–2 minutes.</div>
          </>
        )}
      </div>
    </div>
  );
}
