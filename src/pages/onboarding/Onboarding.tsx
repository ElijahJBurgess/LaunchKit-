import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../../state/AppState';
import { OnboardingProgress } from './OnboardingProgress';
import { Step1Product } from './Step1Product';
import { Step2Customer } from './Step2Customer';
import { Step3Market } from './Step3Market';
import { createExampleExperience, moveOnboardingStep, routeStartsWithExample, type OnboardingStep } from './onboardingFlow';
import './Onboarding.css';

export function Onboarding() {
  const { businessInput, setBusinessInput } = useAppState();
  const location = useLocation();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [isExample, setIsExample] = useState(() => routeStartsWithExample(location.state));
  const navigate = useNavigate();

  const step1Valid = businessInput.businessName.trim() !== '' && businessInput.description.trim() !== '';
  const step2Valid = businessInput.targetAudience.trim() !== '' && businessInput.customerProblem.trim() !== '';
  const step3Valid = businessInput.businessGoal.trim() !== '';

  function handleTryExample() {
    const example = createExampleExperience();
    setBusinessInput(example.input);
    setStep(example.step);
    setIsExample(example.isExample);
  }

  function handleSubmit() {
    if (!step1Valid || !step2Valid || !step3Valid) return;
    navigate('/analysis');
  }

  return (
    <div className="onboarding">
      <div className="onboarding-inner">
        <OnboardingProgress step={step} />
        {isExample && (
          <aside className="example-indicator" aria-label="Example data notice">
            <span>Example: Spotify Launchpad</span>
            Hypothetical concept — not affiliated with Spotify.
          </aside>
        )}
        {step === 1 && (
          <Step1Product
            value={businessInput}
            onChange={setBusinessInput}
            onNext={() => step1Valid && setStep(moveOnboardingStep(step, 'next'))}
            onTryExample={handleTryExample}
            canContinue={step1Valid}
          />
        )}
        {step === 2 && (
          <Step2Customer
            value={businessInput}
            onChange={setBusinessInput}
            onNext={() => step2Valid && setStep(moveOnboardingStep(step, 'next'))}
            onBack={() => setStep(moveOnboardingStep(step, 'back'))}
            canContinue={step2Valid}
          />
        )}
        {step === 3 && (
          <Step3Market
            value={businessInput}
            onChange={setBusinessInput}
            onSubmit={handleSubmit}
            onBack={() => setStep(moveOnboardingStep(step, 'back'))}
            canSubmit={step3Valid}
          />
        )}
      </div>
    </div>
  );
}
