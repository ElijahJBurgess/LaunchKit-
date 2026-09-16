import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../../state/AppState';
import { EXAMPLE_BUSINESS } from '../../data/exampleBusiness';
import { OnboardingProgress } from './OnboardingProgress';
import { Step1Product } from './Step1Product';
import { Step2Customer } from './Step2Customer';
import { Step3Market } from './Step3Market';
import './Onboarding.css';

export function Onboarding() {
  const { businessInput, setBusinessInput } = useAppState();
  const location = useLocation();
  const initialStep = location.state && typeof location.state === 'object' && 'step' in location.state && location.state.step === 2 ? 2 : 1;
  const [step, setStep] = useState<1 | 2 | 3>(initialStep);
  const navigate = useNavigate();

  const step1Valid = businessInput.businessName.trim() !== '' && businessInput.description.trim() !== '';
  const step2Valid = businessInput.targetAudience.trim() !== '' && businessInput.customerProblem.trim() !== '';
  const step3Valid = businessInput.businessGoal.trim() !== '';

  function handleTryExample() {
    setBusinessInput(EXAMPLE_BUSINESS);
    setStep(2);
  }

  function handleSubmit() {
    if (!step1Valid || !step2Valid || !step3Valid) return;
    navigate('/analysis');
  }

  return (
    <div className="onboarding">
      <div className="onboarding-inner">
        <OnboardingProgress step={step} />
        {step === 1 && (
          <Step1Product
            value={businessInput}
            onChange={setBusinessInput}
            onNext={() => step1Valid && setStep(2)}
            onTryExample={handleTryExample}
            canContinue={step1Valid}
          />
        )}
        {step === 2 && (
          <Step2Customer
            value={businessInput}
            onChange={setBusinessInput}
            onNext={() => step2Valid && setStep(3)}
            onBack={() => setStep(1)}
            canContinue={step2Valid}
          />
        )}
        {step === 3 && (
          <Step3Market
            value={businessInput}
            onChange={setBusinessInput}
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
            canSubmit={step3Valid}
          />
        )}
      </div>
    </div>
  );
}
