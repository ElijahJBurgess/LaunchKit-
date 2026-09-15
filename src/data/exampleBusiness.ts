import type { BusinessInput } from '../types/business';

export const EXAMPLE_BUSINESS: BusinessInput = {
  businessName: 'Fernpath',
  website: 'fernpath.io',
  description:
    'A project workspace built specifically for small creative teams, with client-ready shared views and built-in approval rounds.',
  targetAudience: 'Creative agencies and small design/marketing teams of 3-15 people',
  customerProblem:
    'Client feedback gets scattered across email, Slack, and PDFs, and generic PM tools like Asana feel built for engineering sprints, not creative review cycles.',
  differentiation:
    'The only workspace that treats the internal-to-client handoff as a first-class feature, not an afterthought.',
  competitors: 'Notion, Asana, ClickUp',
  businessGoal: 'Launch a Product',
  additionalContext: 'We are a 4-person team preparing for a public launch in about 6 weeks.',
};
