// Mirrors src/types/pmm.ts; shared by the API and browser response validation.
const text = { type: 'string' };
const list = { type: 'array', items: text };
const object = (properties) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const texts = (...names) => Object.fromEntries(names.map((name) => [name, text]));
const lists = (...names) => Object.fromEntries(names.map((name) => [name, list]));
const array = (items) => ({ type: 'array', items });
const icp = object({ ...texts('name', 'who'), ...lists('jobsToBeDone', 'painPoints', 'motivations', 'buyingTriggers', 'objections', 'whatTheyCareAbout') });
const phase = object({ ...texts('name', 'objective', 'kpi'), ...lists('channels', 'tactics') });
export const analysisSchema = object({
  company: object(texts('name', 'summary', 'category')),
  score: object(Object.fromEntries(['overall', 'marketFit', 'messaging', 'differentiation', 'icp', 'launchReadiness', 'positioning'].map((key) => [key, { type: 'number', minimum: 0, maximum: 100 }]))),
  recommendations: object(texts('topOpportunity', 'biggestRisk', 'nextMove')),
  icp: object({ primary: icp, secondary: icp }),
  positioning: object({ ...texts('statement', 'valueProposition', 'elevatorPitch', 'category', 'whyNow'), differentiation: list }),
  messaging: object({ hero: text, ...lists('supportingMessages', 'pillars'), featureBenefits: array(object(texts('feature', 'benefit', 'outcome'))) }),
  competition: object({ competitors: array(object(texts('name', 'strength', 'weakness', 'opportunity'))), takeaway: text, swot: object(lists('strengths', 'weaknesses', 'opportunities', 'threats')) }),
  launch: object({ preLaunch: phase, launch: phase, postLaunch: phase, primaryKPI: text, ...lists('secondaryKPIs', 'checklist') }),
  content: object(texts('landingPage', 'launchEmail', 'linkedin', 'paidSocial', 'googleAd', 'pressRelease', 'productHunt')),
  sales: object({ ...texts('onePager', 'battlecard', 'pitch'), ...lists('objections', 'objectionHandling', 'discoveryQuestions') }),
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
