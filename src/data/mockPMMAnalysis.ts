import type { BusinessInput } from '../types/business';
import type { PMMAnalysis } from '../types/pmm';

function clean(value: string | undefined): string {
  return (value || '').replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
}

function withoutPunctuation(value: string): string {
  return clean(value).replace(/^["']+|["'.!?;,]+$/g, '').trim();
}

function firstSentence(value: string): string {
  const normalized = clean(value);
  const match = normalized.match(/^.*?[.!?](?:\s|$)/);
  return withoutPunctuation(match ? match[0] : normalized);
}

function clipWords(value: string, limit: number): string {
  return withoutPunctuation(value).split(/\s+/).filter(Boolean).slice(0, limit).join(' ');
}

function lowerFirst(value: string): string {
  const normalized = withoutPunctuation(value);
  return normalized ? normalized.charAt(0).toLowerCase() + normalized.slice(1) : normalized;
}

function capitalize(value: string): string {
  const normalized = withoutPunctuation(value);
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : normalized;
}

function audienceLabel(value: string): string {
  const source = firstSentence(value) || 'Focused small teams';
  const label = source.split(/\b(?:who|that|which|without|with no|looking for|seeking)\b/i)[0];
  return clipWords(label, 7) || 'Focused small teams';
}

function productType(value: string): string {
  const source = firstSentence(value) || 'guided planning workspace';
  const category = source
    .replace(/^(?:a|an|the)\s+/i, '')
    .replace(/^(?:hypothetical|new|early-stage)\s+/i, '')
    .split(/\b(?:that|which|designed to|built to|helps?|enables?)\b/i)[0]
    .split(/\b(?:inside|within|for)\b/i)[0]
    .replace(/\b(?:for|inside|within|to|and)\s*$/i, '');
  return lowerFirst(clipWords(category, 6)) || 'guided planning workspace';
}

function problemConcept(value: string): string {
  const sentences = clean(value).split(/(?<=[.!?])\s+/).filter(Boolean);
  let source = firstSentence(
    sentences.find((item) => /\b(?:scattered|fragmented|disconnected|manual|unclear)\b/i.test(item))
      || sentences.find((item) => /\b(?:difficult|hard|struggl|slow|complex)\b/i.test(item))
      || sentences[0]
      || 'a fragmented workflow',
  );
  const state = source.match(/^(.{1,70}?)\s+(?:gets?|becomes?|is|are)\s+(scattered|fragmented|disconnected|manual|unclear|slow|complex)\b/i);
  if (state) return `${state[2].toLowerCase()} ${lowerFirst(clipWords(state[1], 5))}`;
  if (/\sbut\s/i.test(source)) {
    const clauses = source.split(/\sbut\s/i);
    source = clauses[clauses.length - 1] || source;
  }
  source = source.replace(/^.*?\b(?:struggles?|difficulty|difficult|hard)\s+(?:with|to|in)\s+/i, '');
  const cycle = source.match(/before\b.*\bduring\b.*\bafter\s+(?:a|an|the)?\s*([a-z-]+)/i);
  if (cycle) return `${cycle[1].toLowerCase()} planning across the full cycle`;
  source = source
    .replace(/^.*?\b(?:becomes?|gets?|is|are)\s+(?=(?:scattered|fragmented|disconnected|manual|unclear|difficult|slow|complex)\b)/i, '')
    .replace(/^what to do\s+/i, 'planning ');
  return lowerFirst(clipWords(source, 7)) || 'a fragmented workflow';
}

function differentiationConcept(value: string | undefined, audience: string): string {
  if (!clean(value)) return `a workflow shaped around ${lowerFirst(audience)}`;
  let source = firstSentence(value || '');
  source = source.replace(/^unlike\s+[^,]+,\s*/i, '');
  source = source.replace(/^[^,]{0,45}\b(?:would|will|can)\s+/i, '');
  const organized = source.match(/^organize(?:s|d)?\s+(.+?)\s+around\s+(.+?)(?:\s+and\s+|$)/i);
  if (organized) return `a ${lowerFirst(clipWords(organized[1], 5)).replace(/^the\s+/i, '')} organized around ${lowerFirst(clipWords(organized[2], 6))}`;
  const embedded = source.match(/^(.+?)\s+(?:is|are)\s+part of\s+(.+)$/i);
  if (embedded) return `${lowerFirst(clipWords(embedded[1], 5))} embedded in ${lowerFirst(clipWords(embedded[2], 6))}`;
  return lowerFirst(clipWords(source, 12)) || `a workflow shaped around ${lowerFirst(audience)}`;
}

function alternatives(value: string | undefined): string[] {
  const entries = clean(value)
    .split(/,|\band\b/i)
    .map((item) => withoutPunctuation(item))
    .filter(Boolean)
    .slice(0, 5);
  return entries.length ? entries : ['spreadsheets', 'manual workflows', 'generic project tools'];
}

function initiativeLabel(category: string, problem: string): string {
  const planning = `${category} ${problem}`.match(/\b([a-z][a-z-]*)[-\s]planning\b/i);
  if (planning) return planning[1].toLowerCase();
  const launch = `${category} ${problem}`.match(/\b(launch|release|campaign)\b/i);
  return launch ? launch[1].toLowerCase() : 'initiative';
}

function headline(name: string, problem: string): string {
  let result = `${clipWords(name, 3)} turns ${clipWords(problem, 6)} into one clear coordinated plan`;
  if (result.split(/\s+/).length < 8) result += ' for focused teams';
  return result.split(/\s+/).slice(0, 16).join(' ');
}

function clamp(value: number, min = 40, max = 98): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  return hash;
}

export function generateMockAnalysis(input: BusinessInput): PMMAnalysis {
  const name = clean(input.businessName) || 'Your product';
  const audience = audienceLabel(input.targetAudience);
  const category = productType(input.description);
  const problem = problemConcept(input.customerProblem);
  const difference = differentiationConcept(input.differentiation, audience);
  const competitorNames = alternatives(input.competitors);
  const primaryAlternative = competitorNames[0];
  const initiative = initiativeLabel(category, problem);
  const goal = clean(input.businessGoal) || 'Acquire Customers';
  const seed = hashSeed(`${name}|${category}|${audience}|${problem}`);
  const completeness = [input.differentiation, input.competitors, input.additionalContext, input.website].filter((value) => clean(value)).length * 4;
  const overall = clamp(66 + completeness + (seed % 13));
  const valueProposition = `Bring ${problem}, priorities, and next steps into one guided ${category} for ${lowerFirst(audience)}.`;
  const positioningStatement = `For ${lowerFirst(audience)}, ${name} is a ${category} that turns ${problem} into one coordinated plan.`;
  const primaryKpi = goal === 'Increase Adoption' ? 'Weekly active users completing the core workflow' : goal === 'Acquire Customers' ? 'New qualified customers per week' : 'Users completing the core workflow after launch';

  return {
    company: {
      name,
      summary: `${name} is a ${category} for ${lowerFirst(audience)}. Its core difference is ${difference}.`,
      category: capitalize(category),
    },
    score: {
      overall,
      marketFit: clamp(overall - 3 + (seed % 6)),
      messaging: clamp(overall - 2 + ((seed >> 2) % 7)),
      differentiation: clamp(overall + (clean(input.differentiation) ? 5 : -5)),
      icp: clamp(overall + 4),
      launchReadiness: clamp(overall - 8 + ((seed >> 4) % 6)),
      positioning: clamp(overall + 2),
    },
    recommendations: {
      topOpportunity: `Own the connection between ${problem} and a guided workflow designed for ${lowerFirst(audience)}.`,
      biggestRisk: `Broad messaging could make ${name} sound interchangeable with ${lowerFirst(primaryAlternative)} instead of highlighting ${difference}.`,
      nextMove: `Test one landing-page message about ${problem} with a small group of ${lowerFirst(audience)} before expanding the campaign.`,
    },
    icp: {
      primary: {
        name: audience,
        who: `${audience} who need a clearer way to coordinate their next ${initiative}.`,
        jobsToBeDone: [`Replace ${problem} with one coordinated plan`, 'Keep priorities, ownership, and next steps visible'],
        painPoints: [capitalize(problem), 'Important context and ownership spread across separate tools'],
        motivations: ['Run the work with more clarity and confidence', 'Spend less time maintaining a manual process'],
        buyingTriggers: ['A new initiative exposes gaps in the current workflow', 'The existing process creates unclear ownership or missed handoffs'],
        objections: [`We already use ${primaryAlternative}`, 'Changing the current workflow may create more work'],
        whatTheyCareAbout: ['Clear ownership', 'A simple path to the next action', 'Fit with the way the work already happens'],
      },
      secondary: {
        name: `Adjacent ${clipWords(audience, 5)}`,
        who: `People adjacent to ${lowerFirst(audience)} who manage a lighter version of the same workflow.`,
        jobsToBeDone: ['Coordinate a smaller initiative without adding operational overhead'],
        painPoints: ['Generic tools require more setup than the work justifies'],
        motivations: ['Create a repeatable process with a small team'],
        buyingTriggers: ['A manual workflow stops providing enough visibility'],
        objections: ['The use case may feel too occasional for another tool'],
        whatTheyCareAbout: ['Simplicity', 'Low setup effort', 'A workflow that can grow with the work'],
      },
    },
    positioning: {
      headline: headline(name, problem),
      statement: positioningStatement,
      valueProposition,
      elevatorPitch: `${name} gives ${lowerFirst(audience)} one guided place to replace ${problem} with a coordinated plan. Its advantage is ${difference}, so the workflow starts closer to the way the work happens.`,
      category: capitalize(category),
      differentiation: [capitalize(difference), `Designed around the workflow of ${lowerFirst(audience)}`, 'Connects strategic direction with concrete next actions'],
      whyNow: `As the work spans more channels and contributors, ${lowerFirst(audience)} need clearer ownership and a more coherent operating rhythm.`,
    },
    messaging: {
      hero: `Turn ${problem} into one clear plan.`,
      supportingMessages: [`Bring strategy and execution into the same ${category}`, 'See ownership and next steps without rebuilding the process', `Work from a structure designed for ${lowerFirst(audience)}`],
      pillars: ['Clarity from the start', 'A workflow that fits', 'Strategy connected to action'],
      featureBenefits: [
        { feature: 'Guided planning workflow', benefit: 'Teams start with a clear structure', outcome: 'Less ambiguity about what happens next' },
        { feature: 'Shared priorities and ownership', benefit: 'Contributors can see their role in the plan', outcome: 'Fewer handoff gaps across the workflow' },
        { feature: `Structure built for ${lowerFirst(audience)}`, benefit: 'The process requires less adaptation', outcome: 'The team can focus on the work instead of configuring the tool' },
      ],
    },
    competition: {
      competitors: competitorNames.slice(0, 3).map((alternative, index) => ({
        name: alternative,
        strength: index === 0 ? 'Familiar and already present in many workflows' : 'Flexible enough to support a wide range of tasks',
        weakness: `May require ${lowerFirst(audience)} to assemble and maintain their own process for ${problem}`,
        opportunity: `Position ${name} around ${difference} and the reduced need to design the workflow from scratch`,
      })),
      takeaway: `Compete on workflow fit rather than total feature count: ${name} should make ${problem} clearer for ${lowerFirst(audience)}.`,
      swot: {
        strengths: [capitalize(difference), `A focused workflow for ${lowerFirst(audience)}`],
        weaknesses: ['An early product requires category education', 'A focused scope may not replace every existing tool'],
        opportunities: [`Teams using ${lowerFirst(primaryAlternative)} may want a clearer starting structure`, 'A focused workflow can support strong peer recommendations'],
        threats: ['Established alternatives may add similar guided templates', 'Broad messaging could blur the product category'],
      },
    },
    launch: {
      preLaunch: {
        name: 'Pre-Launch',
        objective: `Validate the problem and message with ${lowerFirst(audience)}`,
        channels: ['Focused landing page', 'Direct customer conversations', 'One relevant community'],
        tactics: ['Interview a small set of target users about their current workflow', `Test the message around ${problem}`, 'Collect qualified interest with a single clear next step'],
        kpi: 'Qualified conversations and waitlist signups',
      },
      launch: {
        name: 'Launch',
        objective: 'Turn validated interest into active use of the core workflow',
        channels: ['Founder-led social', 'Email to validated prospects', 'A focused launch platform'],
        tactics: ['Prepare launch assets around one consistent message', 'Personally support the first group through the core workflow', 'Capture friction and questions during onboarding'],
        kpi: 'Users completing the core workflow',
      },
      postLaunch: {
        name: 'Post-Launch',
        objective: 'Use early behavior and interviews to improve retention and positioning',
        channels: ['Lifecycle email', 'Customer interviews', 'Targeted follow-up'],
        tactics: ['Review where users stop in the workflow', 'Interview users who complete the core action', 'Refine the message around the strongest repeated value'],
        kpi: 'Repeat use of the core workflow',
      },
      primaryKPI: primaryKpi,
      secondaryKPIs: ['Landing-page visitor to signup conversion', 'Core workflow completion rate', 'Repeat usage after initial activation'],
      checklist: ['Validate the core message with target users', 'Publish one focused landing page', 'Instrument signup and workflow completion', 'Prepare launch email and social assets', 'Plan personal onboarding for the first users'],
    },
    content: {
      landingPage: `Headline: ${headline(name, problem)}\n\nSubhead: ${valueProposition}\n\n${name} gives ${lowerFirst(audience)} a clearer way to connect strategy, ownership, and execution.\n\nCTA: Build a clearer plan`,
      launchEmail: `Subject: A clearer alternative to ${problem}\n\n${name} brings the work into one guided ${category}. It is designed for ${lowerFirst(audience)}, with ${difference}.\n\nCTA: Explore ${name}`,
      linkedin: `${capitalize(problem)} should not require a patchwork process. ${name} gives ${lowerFirst(audience)} one guided workflow for moving from strategy to action. We are sharing the first version and looking for thoughtful feedback.`,
      paidSocial: `${capitalize(problem)}, one guided workflow. See how ${name} helps ${lowerFirst(audience)} move from plan to action.`,
      googleAd: `Headline 1: ${clipWords(name, 4)}\nHeadline 2: A Clearer Guided Workflow\nDescription: Coordinate ${clipWords(problem, 6)} with a focused ${category}.`,
      pressRelease: `${name} introduces a ${category} for ${lowerFirst(audience)}. The product brings ${problem} into one guided workflow organized around ${difference}.`,
      productHunt: `Tagline: A guided ${category} for ${lowerFirst(audience)}\n\n${name} connects strategy, ownership, and execution in one focused workflow. We are looking for feedback from teams managing ${problem}.`,
    },
    sales: {
      motion: {
        target: `${audience} preparing their next ${initiative}`,
        openingQuestion: 'How are you coordinating this work today?',
        value: valueProposition,
        reasonToBelieve: `The key difference is ${difference}, rather than a generic project template.`,
        callToAction: initiative === 'initiative' ? 'Build your next plan.' : `Build your next ${initiative} plan.`,
      },
      discoveryQuestions: ['How are you coordinating this work today?', 'Where does the current process create the most friction?', `What would make your next ${initiative} feel more organized?`],
      objections: [
        { objection: `We already use ${primaryAlternative}.`, response: `Keep it for the work it handles well, then compare how a guided workflow replaces ${problem} without requiring the team to design the process.` },
        { objection: 'How is this different from our current setup?', response: `The recommended difference is ${difference}, with strategy and next actions kept in the same workflow.` },
        { objection: 'Is changing the workflow worth the effort?', response: 'Start with one active initiative and judge whether the clearer structure improves ownership and coordination.' },
      ],
      onePager: `${name} is a ${category} for ${lowerFirst(audience)}. It replaces ${problem} with one guided workflow connecting strategy, ownership, and execution. Instead of assembling the process with ${primaryAlternative} and other general tools, teams start with ${difference}. ${initiative === 'initiative' ? 'Build your next plan.' : `Build your next ${initiative} plan.`}`,
      battlecard: `${capitalize(primaryAlternative)} and other general tools are familiar and flexible, which is why teams use them. Their likely gap is the setup required to replace ${problem} with a repeatable process. Lead with ${difference} and the ability to begin with a focused workflow rather than a blank template.`,
      pitch: `${capitalize(problem)} can separate strategy from execution across several tools. ${name} brings that work into one guided ${category} for ${lowerFirst(audience)}. Its advantage is ${difference}, giving the team a clearer structure for its next initiative.`,
    },
  };
}
