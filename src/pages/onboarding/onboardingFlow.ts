import { EXAMPLE_BUSINESS } from '../../data/exampleBusiness';
import type { BusinessInput } from '../../types/business';

export type OnboardingStep = 1 | 2 | 3;

export interface ExampleExperience {
  input: BusinessInput;
  step: OnboardingStep;
  isExample: true;
}

export function createExampleExperience(): ExampleExperience {
  return { input: { ...EXAMPLE_BUSINESS }, step: 1, isExample: true };
}

export function moveOnboardingStep(step: OnboardingStep, direction: 'next' | 'back'): OnboardingStep {
  if (direction === 'next') return Math.min(3, step + 1) as OnboardingStep;
  return Math.max(1, step - 1) as OnboardingStep;
}

export function routeStartsWithExample(state: unknown): boolean {
  return !!state && typeof state === 'object' && 'example' in state && state.example === true;
}
