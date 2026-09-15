export interface BusinessInput {
  businessName: string;
  website?: string;
  description: string;

  targetAudience: string;
  customerProblem: string;
  differentiation?: string;

  competitors?: string;
  businessGoal: string;
  additionalContext?: string;
}

export const EMPTY_BUSINESS_INPUT: BusinessInput = {
  businessName: '',
  website: '',
  description: '',
  targetAudience: '',
  customerProblem: '',
  differentiation: '',
  competitors: '',
  businessGoal: '',
  additionalContext: '',
};

export const BUSINESS_GOALS = [
  'Acquire Customers',
  'Launch a Product',
  'Increase Adoption',
  'Enter a New Market',
  'Improve Positioning',
  'Other',
] as const;

export type BusinessGoal = (typeof BUSINESS_GOALS)[number];
