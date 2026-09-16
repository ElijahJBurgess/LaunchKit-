import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { readFile } from 'node:fs/promises';
import * as contract from '../shared/pmmSchema.js';

const { analysisSchema } = contract;

const businessInput = {
  businessName: 'Northstar',
  description: 'A guided planning workspace that helps small teams coordinate a complex launch from one clear operating plan.',
  targetAudience: 'Independent operators and compact teams who coordinate launches themselves without a dedicated product marketing department.',
  customerProblem: 'Launch planning becomes fragmented across documents, spreadsheets, chat threads, and disconnected tools that obscure ownership and timing.',
  differentiation: 'A guided workflow organized around the launch cycle, with strategy and execution kept together in one focused workspace.',
  competitors: 'Spreadsheets, generic project-management tools, and manual agency workflows',
  businessGoal: 'Launch a Product',
  additionalContext: 'The product is early and should avoid unsupported claims about customer results, speed, revenue, or adoption.',
};

function validSales() {
  return {
    sales: {
      motion: {
        target: 'Small teams preparing complex launches',
        openingQuestion: 'How are you coordinating your next launch today?',
        value: 'Bring launch strategy, ownership, and execution into one guided plan.',
        reasonToBelieve: 'The workflow follows the launch cycle instead of a generic project template.',
        callToAction: 'Build your next launch plan.',
      },
      discoveryQuestions: [
        'How do you coordinate launch work today?',
        'Where does the process create the most friction?',
        'What would make the next launch feel successful?',
      ],
      objections: [
        { objection: 'We already use a project-management tool.', response: 'Keep it for general work and compare how a launch-specific workflow handles the critical handoffs.' },
      ],
      onePager: 'Northstar is a launch-planning workspace for small teams. It connects strategy, ownership, and execution in one guided workflow. Build your next launch plan.',
      battlecard: 'Generic project tools are flexible and familiar. Their gap is the setup required to model a launch. Position Northstar around its launch-specific guided workflow.',
      pitch: 'Launch work often becomes scattered across several tools. Northstar brings the plan and execution into one guided workflow built around the launch cycle. See how it could support your next launch.',
    },
  };
}

test('strategy schema exposes dedicated headline, sales motion, and paired objections', () => {
  const positioning = analysisSchema.properties.positioning.properties;
  const sales = analysisSchema.properties.sales.properties;

  assert.equal(positioning.headline.type, 'string');
  assert.deepEqual(Object.keys(sales.motion.properties), [
    'target',
    'openingQuestion',
    'value',
    'reasonToBelieve',
    'callToAction',
  ]);
  assert.deepEqual(Object.keys(sales.objections.items.properties), ['objection', 'response']);
  assert.equal(Object.hasOwn(sales, 'objectionHandling'), false);
});

test('semantic validation accepts a concise sales contract', () => {
  assert.equal(typeof contract.validateAnalysisPayload, 'function');
  assert.equal(contract.validateAnalysisPayload(validSales(), businessInput, 'sales'), true);
});

test('semantic validation rejects copied source paragraphs and broken sales structure', () => {
  const copied = validSales();
  copied.sales.motion.value = businessInput.customerProblem;
  assert.equal(contract.validateAnalysisPayload(copied, businessInput, 'sales'), false);

  const wrongQuestionCount = validSales();
  wrongQuestionCount.sales.discoveryQuestions.pop();
  assert.equal(contract.validateAnalysisPayload(wrongQuestionCount, businessInput, 'sales'), false);

  const malformedQuestion = validSales();
  malformedQuestion.sales.discoveryQuestions[0] = 'Tell me about the current workflow.';
  assert.equal(contract.validateAnalysisPayload(malformedQuestion, businessInput, 'sales'), false);

  const pitchAsCta = validSales();
  pitchAsCta.sales.motion.callToAction = pitchAsCta.sales.pitch;
  assert.equal(contract.validateAnalysisPayload(pitchAsCta, businessInput, 'sales'), false);

  const malformedPunctuation = validSales();
  malformedPunctuation.sales.pitch = 'Launch work is fragmented"., and difficult to coordinate.';
  assert.equal(contract.validateAnalysisPayload(malformedPunctuation, businessInput, 'sales'), false);
});

test('semantic validation enforces a concise Overview headline and ICP label', () => {
  const positioning = {
    positioning: {
      headline: 'Northstar turns scattered launch work into one clear operating plan',
      statement: 'For small launch teams, Northstar is a guided workspace that connects strategy and execution.',
      valueProposition: 'Coordinate launch strategy, ownership, and execution from one guided workspace.',
      elevatorPitch: 'Northstar gives compact teams one place to plan and run a coordinated launch.',
      category: 'Launch planning workspace',
      differentiation: ['Organized around the launch cycle rather than a generic project template.'],
      whyNow: 'Teams need clearer ownership as launch work spans more channels and contributors.',
    },
  };
  assert.equal(contract.validateAnalysisPayload(positioning, businessInput, 'positioning'), true);
  positioning.positioning.headline = 'A headline that keeps going far beyond the intended display length because it repeats too many unnecessary words about the product';
  assert.equal(contract.validateAnalysisPayload(positioning, businessInput, 'positioning'), false);

  const icp = {
    icp: {
      primary: { name: 'Independent launch teams', who: 'Small teams coordinating launches themselves.', jobsToBeDone: ['Coordinate a launch'], painPoints: ['Fragmented planning'], motivations: ['Clear ownership'], buyingTriggers: ['A new launch'], objections: ['We have tools'], whatTheyCareAbout: ['Clarity'] },
      secondary: { name: 'Agency launch leads', who: 'Agency leads coordinating client launches.', jobsToBeDone: ['Coordinate clients'], painPoints: ['Scattered approvals'], motivations: ['Reliable delivery'], buyingTriggers: ['A new client'], objections: ['Workflow change'], whatTheyCareAbout: ['Visibility'] },
    },
  };
  assert.equal(contract.validateAnalysisPayload(icp, businessInput, 'icp'), true);
  icp.icp.primary.name = 'Independent operators and compact teams coordinating launches without dedicated product marketing support';
  assert.equal(contract.validateAnalysisPayload(icp, businessInput, 'icp'), false);
});

test('mock strategy derives concise concepts instead of copying onboarding paragraphs', async () => {
  const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  try {
    const { generateMockAnalysis } = await vite.ssrLoadModule('/src/data/mockPMMAnalysis.ts');
    const analysis = generateMockAnalysis(businessInput);
    assert.equal(contract.validateAnalysisPayload(analysis, businessInput), true);
    const output = JSON.stringify(analysis).replace(/\s+/g, ' ').toLowerCase();
    for (const key of ['description', 'targetAudience', 'customerProblem', 'differentiation', 'additionalContext']) {
      assert.equal(output.includes(businessInput[key].replace(/\s+/g, ' ').toLowerCase()), false, `${key} was copied into mock output`);
    }
    assert.equal(analysis.sales.discoveryQuestions.length, 3);
    assert.notEqual(analysis.sales.motion.callToAction, analysis.sales.pitch);
    assert.doesNotMatch(JSON.stringify(analysis), /\b(?:for for|manage run|coordinate run|around organize|is organized around organize)\b/i);
    assert.doesNotMatch(analysis.positioning.category, /\b(?:for|inside|within|to|and)$/i);
    assert.doesNotMatch(analysis.sales.motion.openingQuestion, /\b(?:manage|managing|coordinate)\s+(?:run|make|do)\b/i);
  } finally {
    await vite.close();
  }
});

test('Sales UI reads explicit motion fields and never uses the pitch as its CTA', async () => {
  const source = await readFile(new URL('../src/pages/workspace/tabs/Sales.tsx', import.meta.url), 'utf8');
  assert.match(source, /sales\.motion\.callToAction/);
  assert.doesNotMatch(source, /Call to action['"],\s*sales\.pitch/);
  assert.match(source, /sales-step-label/);
  assert.match(source, /sales-step-value/);
});
