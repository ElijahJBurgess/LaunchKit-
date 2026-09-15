export interface ICP {
  name: string;
  who: string;
  jobsToBeDone: string[];
  painPoints: string[];
  motivations: string[];
  buyingTriggers: string[];
  objections: string[];
  whatTheyCareAbout: string[];
}

export interface FeatureBenefit {
  feature: string;
  benefit: string;
  outcome: string;
}

export interface Competitor {
  name: string;
  strength: string;
  weakness: string;
  opportunity: string;
}

export interface LaunchPhase {
  name: string;
  objective: string;
  channels: string[];
  tactics: string[];
  kpi: string;
}

export interface PMMAnalysis {
  company: {
    name: string;
    summary: string;
    category: string;
  };

  score: {
    overall: number;
    marketFit: number;
    messaging: number;
    differentiation: number;
    icp: number;
    launchReadiness: number;
    positioning: number;
  };

  recommendations: {
    topOpportunity: string;
    biggestRisk: string;
    nextMove: string;
  };

  icp: {
    primary: ICP;
    secondary: ICP;
  };

  positioning: {
    statement: string;
    valueProposition: string;
    elevatorPitch: string;
    category: string;
    differentiation: string[];
    whyNow: string;
  };

  messaging: {
    hero: string;
    supportingMessages: string[];
    pillars: string[];
    proofPoints: string[];
    featureBenefits: FeatureBenefit[];
  };

  competition: {
    competitors: Competitor[];
    takeaway: string;
    swot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
  };

  launch: {
    preLaunch: LaunchPhase;
    launch: LaunchPhase;
    postLaunch: LaunchPhase;
    primaryKPI: string;
    secondaryKPIs: string[];
    checklist: string[];
  };

  content: {
    landingPage: string;
    launchEmail: string;
    linkedin: string;
    paidSocial: string;
    googleAd: string;
    pressRelease: string;
    productHunt: string;
  };

  sales: {
    onePager: string;
    battlecard: string;
    objections: string[];
    objectionHandling: string[];
    discoveryQuestions: string[];
    pitch: string;
  };
}

export type ContentAssetKey = keyof PMMAnalysis['content'];

export const CONTENT_ASSET_LABELS: Record<ContentAssetKey, string> = {
  landingPage: 'Landing Page Copy',
  launchEmail: 'Launch Email',
  linkedin: 'LinkedIn Post',
  paidSocial: 'Paid Social Ad',
  googleAd: 'Google Ad',
  pressRelease: 'Press Release',
  productHunt: 'Product Hunt Launch',
};

export const WORKSPACE_TABS = [
  'overview',
  'icp',
  'positioning',
  'messaging',
  'competition',
  'launch',
  'content',
  'sales',
] as const;

export type WorkspaceTab = (typeof WORKSPACE_TABS)[number];

export const WORKSPACE_TAB_LABELS: Record<WorkspaceTab, string> = {
  overview: 'Overview',
  icp: 'ICP',
  positioning: 'Positioning',
  messaging: 'Messaging',
  competition: 'Competition',
  launch: 'Launch',
  content: 'Content',
  sales: 'Sales',
};
