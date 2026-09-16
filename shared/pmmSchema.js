// Mirrors src/types/pmm.ts; shared by the API and browser response validation.
const text = (description) => ({ type: 'string', ...(description ? { description } : {}) });
const number = { type: 'number', minimum: 0, maximum: 100 };
const object = (properties, description) => ({
  type: 'object',
  ...(description ? { description } : {}),
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
const list = (description, itemDescription) => ({
  type: 'array',
  ...(description ? { description } : {}),
  items: text(itemDescription),
});
const array = (items, description) => ({ type: 'array', ...(description ? { description } : {}), items });

const icp = object({
  name: text('A short segment label of approximately 2–7 words. Never copy the full audience description.'),
  who: text('One concise sentence describing who belongs to this segment.'),
  jobsToBeDone: list('Short standalone jobs this segment needs to accomplish.'),
  painPoints: list('Short standalone problems, synthesized from the source material.'),
  motivations: list('Short standalone motivations.'),
  buyingTriggers: list('Specific events or conditions that create urgency.'),
  objections: list('Concise objections this segment may raise.'),
  whatTheyCareAbout: list('Concise decision criteria for this segment.'),
});

const phase = object({
  name: text('Short phase name.'),
  objective: text('One concise, outcome-oriented phase objective.'),
  channels: list('The most relevant channels for this phase.'),
  tactics: list('Concrete actions for this phase.'),
  kpi: text('One measurable success signal. Do not invent a result or benchmark.'),
});

const salesMotion = object({
  target: text('A short target segment, not the full ICP paragraph.'),
  openingQuestion: text('One conversational discovery question, preferably under 20 words, with no product pitch.'),
  value: text('One natural sentence stating the primary customer value.'),
  reasonToBelieve: text('One concise differentiating reason grounded in the supplied strategy. Do not invent proof.'),
  callToAction: text('A direct next step of approximately 3–10 words. Never use the sales pitch or a paragraph.'),
});

const salesObjection = object({
  objection: text('A concise, conversational objection.'),
  response: text('A complete, concise response grounded in the strategy, with no invented proof or metrics.'),
});

export const analysisSchema = object({
  company: object({
    name: text('The business or product name as supplied.'),
    summary: text('A concise executive summary rewritten from the source material.'),
    category: text('A short, recognizable market category.'),
  }),
  score: object(Object.fromEntries(['overall', 'marketFit', 'messaging', 'differentiation', 'icp', 'launchReadiness', 'positioning'].map((key) => [key, number]))),
  recommendations: object({
    topOpportunity: text('The strongest strategic opportunity in one concise recommendation.'),
    biggestRisk: text('The most important risk, stated without invented evidence.'),
    nextMove: text('One concrete next action.'),
  }),
  icp: object({ primary: icp, secondary: icp }),
  positioning: object({
    headline: text('A natural 8–16 word transformation headline. Do not truncate, quote, or paste a source paragraph.'),
    statement: text('A clean positioning statement written as finished strategy copy.'),
    valueProposition: text('One concise natural sentence, preferably 10–25 words, explaining the primary value.'),
    elevatorPitch: text('A concise elevator pitch that synthesizes the source material.'),
    category: text('A short positioning category.'),
    differentiation: list('Concise reasons the product is meaningfully different. Do not insert raw onboarding paragraphs.'),
    whyNow: text('A grounded explanation of urgency without inventing market facts or performance claims.'),
  }),
  messaging: object({
    hero: text('A short, memorable, customer-facing hero line.'),
    supportingMessages: list('Usable supporting messages that do not repeat the positioning statement verbatim.'),
    pillars: list('Short messaging themes, not paragraphs.'),
    featureBenefits: array(object({
      feature: text('A concise feature or capability.'),
      benefit: text('The direct customer benefit; it must make sense independently.'),
      outcome: text('The resulting customer outcome; do not invent measured results.'),
    }), 'Feature-to-benefit-to-outcome mappings whose cells each stand alone.'),
  }),
  competition: object({
    competitors: array(object({
      name: text('A relevant named or category alternative.'),
      strength: text('Why customers use this alternative, without unverifiable claims.'),
      weakness: text('A careful gap or limitation; never claim the alternative cannot do something without supplied proof.'),
      opportunity: text('The recommended positioning angle against this alternative.'),
    }), 'Relevant alternatives, including manual workflows or categories where appropriate.'),
    takeaway: text('A concise competitive recommendation.'),
    swot: object({
      strengths: list('Grounded internal strengths.'),
      weaknesses: list('Grounded internal weaknesses.'),
      opportunities: list('Grounded external opportunities.'),
      threats: list('Grounded external threats.'),
    }),
  }),
  launch: object({
    preLaunch: phase,
    launch: phase,
    postLaunch: phase,
    primaryKPI: text('The primary success signal. Do not invent a result or benchmark.'),
    secondaryKPIs: list('Supporting success signals.'),
    checklist: list('Concrete launch actions.'),
  }),
  content: object({
    landingPage: text('Usable landing-page copy rewritten from the strategy.'),
    launchEmail: text('Usable launch email copy rewritten from the strategy.'),
    linkedin: text('Usable LinkedIn launch copy.'),
    paidSocial: text('Usable paid-social copy without unsupported claims.'),
    googleAd: text('Usable search-ad copy without unsupported claims.'),
    pressRelease: text('A concise press-release draft with no fabricated quotations or results.'),
    productHunt: text('Usable Product Hunt launch copy.'),
  }),
  sales: object({
    motion: salesMotion,
    discoveryQuestions: list('Exactly three useful questions covering current workflow, biggest friction, and desired outcome. Every item must be a natural question ending in a question mark.'),
    objections: array(salesObjection, 'Objection and response pairs that can never become mismatched.'),
    onePager: text('Concise rewritten sales copy covering what it is, who it serves, the problem, value, differentiation, and CTA.'),
    battlecard: text('A concise comparison of relevant alternatives, why buyers use them, their gap, and the recommended positioning angle.'),
    pitch: text('An actual 2–4 sentence pitch flowing from problem to product to value to differentiation or next step.'),
  }),
});

export function isSection(section) {
  return typeof section === 'string' && Object.hasOwn(analysisSchema.properties, section);
}

export function schemaFor(section) {
  if (section === undefined) return analysisSchema;
  if (!isSection(section)) throw new Error('Invalid analysis section');
  return object({ [section]: analysisSchema.properties[section] });
}

// Validate the limited JSON Schema vocabulary defined above, including nested arrays.
function matches(value, schema) {
  if (schema.type === 'string') return typeof value === 'string';
  if (schema.type === 'number') return typeof value === 'number' && Number.isFinite(value) && value >= schema.minimum && value <= schema.maximum;
  if (schema.type === 'array') return Array.isArray(value) && value.every((item) => matches(item, schema.items));
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === schema.required.length
    && schema.required.every((key) => Object.hasOwn(value, key) && matches(value[key], schema.properties[key]));
}

export function isAnalysisPayload(value, section) {
  return matches(value, schemaFor(section));
}

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function words(value) {
  const normalized = normalize(value);
  return normalized ? normalized.split(' ').length : 0;
}

function collectStrings(value, result = []) {
  if (typeof value === 'string') result.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, result));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectStrings(item, result));
  return result;
}

function sourceParagraphs(input) {
  if (!input || typeof input !== 'object') return [];
  return ['description', 'targetAudience', 'customerProblem', 'differentiation', 'competitors', 'additionalContext']
    .map((key) => normalize(input[key]))
    .filter((value) => value.length >= 70 && words(value) >= 10);
}

function sectionData(value, section) {
  if (!section) return value;
  return value?.[section];
}

export function analysisPayloadIssues(value, input, section) {
  if (!isAnalysisPayload(value, section)) return ['The response does not match the required strategy structure.'];
  const issues = [];
  const outputStrings = collectStrings(value).map(normalize);

  for (const source of sourceParagraphs(input)) {
    if (outputStrings.some((output) => output.includes(source))) {
      issues.push('Generated copy contains a full onboarding paragraph.');
      break;
    }
  }
  if (collectStrings(value).some((output) => /(?:\.\s*,|,\s*\.|["”]\s*\.\s*,)/.test(output))) {
    issues.push('Generated copy contains malformed punctuation.');
  }

  const positioning = section === 'positioning' || !section ? sectionData(value, section)?.positioning || value?.positioning : undefined;
  if (positioning) {
    const headlineWords = words(positioning.headline);
    if (headlineWords < 8 || headlineWords > 16 || positioning.headline.length > 130 || /…|\.\.\./.test(positioning.headline)) {
      issues.push('The positioning headline must be a complete 8–16 word headline.');
    }
    if (!normalize(positioning.valueProposition) || words(positioning.valueProposition) > 35) {
      issues.push('The value proposition must be concise and complete.');
    }
  }

  const icpSection = section === 'icp' || !section ? sectionData(value, section)?.icp || value?.icp : undefined;
  if (icpSection) {
    for (const segment of [icpSection.primary, icpSection.secondary]) {
      if (!normalize(segment.name) || words(segment.name) > 7 || segment.name.length > 70) {
        issues.push('ICP names must be short segment labels.');
        break;
      }
    }
  }

  const sales = section === 'sales' || !section ? sectionData(value, section)?.sales || value?.sales : undefined;
  if (sales) {
    const motion = sales.motion;
    if (Object.values(motion).some((field) => !normalize(field))) issues.push('Every sales motion field must be non-empty.');
    if (!motion.openingQuestion.trim().endsWith('?') || words(motion.openingQuestion) > 24) issues.push('The opening question must be concise and end with a question mark.');
    if (words(motion.target) > 18 || motion.target.length > 140) issues.push('The sales target must be concise.');
    if (words(motion.value) > 35 || words(motion.reasonToBelieve) > 40) issues.push('Sales value and reason-to-believe fields must be concise.');
    const ctaWords = words(motion.callToAction);
    if (ctaWords < 3 || ctaWords > 10 || motion.callToAction.length > 90) issues.push('The call to action must be approximately 3–10 words.');
    if (normalize(motion.callToAction) === normalize(sales.pitch)) issues.push('The call to action must be independent from the sales pitch.');
    if (sales.discoveryQuestions.length !== 3 || sales.discoveryQuestions.some((question) => !question.trim().endsWith('?') || words(question) > 30)) {
      issues.push('Sales must include exactly three concise discovery questions.');
    }
    if (sales.objections.length < 1 || sales.objections.length > 5 || sales.objections.some(({ objection, response }) => !normalize(objection) || !normalize(response) || words(objection) > 30 || words(response) > 80)) {
      issues.push('Sales objections must contain complete objection and response pairs.');
    }
  }

  return issues;
}

export function validateAnalysisPayload(value, input, section) {
  return analysisPayloadIssues(value, input, section).length === 0;
}
