import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const viteConfig = { server: { middlewareMode: true, hmr: false }, appType: 'custom' };

async function loadModules() {
  const vite = await createServer(viteConfig);
  const example = await vite.ssrLoadModule('/src/data/exampleBusiness.ts');
  const flow = await vite.ssrLoadModule('/src/pages/onboarding/onboardingFlow.ts');
  const mock = await vite.ssrLoadModule('/src/data/mockPMMAnalysis.ts');
  await vite.close();
  return { ...example, ...flow, ...mock };
}

test('Spotify Launchpad example fills every required business input field with a valid goal', async () => {
  const { EXAMPLE_BUSINESS } = await loadModules();
  assert.equal(EXAMPLE_BUSINESS.businessName, 'Spotify Launchpad');
  for (const key of ['businessName', 'website', 'description', 'targetAudience', 'customerProblem', 'differentiation', 'competitors', 'businessGoal', 'additionalContext']) {
    assert.equal(typeof EXAMPLE_BUSINESS[key], 'string');
    assert.ok(EXAMPLE_BUSINESS[key].trim().length > 0, `${key} should be populated`);
  }
  assert.equal(EXAMPLE_BUSINESS.businessGoal, 'Launch a Product');
  assert.match(EXAMPLE_BUSINESS.additionalContext, /hypothetical.*not affiliated with Spotify/i);
});

test('loading the example stays on step one and does not request generation', async () => {
  const { createExampleExperience, EXAMPLE_BUSINESS } = await loadModules();
  let generationCalls = 0;
  const state = createExampleExperience(() => { generationCalls += 1; });
  assert.equal(state.step, 1);
  assert.equal(state.isExample, true);
  assert.deepEqual(state.input, EXAMPLE_BUSINESS);
  assert.equal(generationCalls, 0);
});

test('example onboarding advances and returns manually while preserving editable input', async () => {
  const { createExampleExperience, moveOnboardingStep } = await loadModules();
  const state = createExampleExperience();
  assert.equal(moveOnboardingStep(state.step, 'next'), 2);
  assert.equal(moveOnboardingStep(2, 'next'), 3);
  assert.equal(moveOnboardingStep(3, 'back'), 2);
  assert.equal(moveOnboardingStep(2, 'back'), 1);
  const edited = { ...state.input, businessName: 'My artist launch tool', targetAudience: 'DIY musicians' };
  assert.equal(edited.businessName, 'My artist launch tool');
  assert.equal(edited.targetAudience, 'DIY musicians');
  assert.equal(state.input.businessName, 'Spotify Launchpad');
});

test('Spotify example uses the normal mock strategy pipeline', async () => {
  const { EXAMPLE_BUSINESS, generateMockAnalysis } = await loadModules();
  const analysis = generateMockAnalysis(EXAMPLE_BUSINESS);
  assert.equal(analysis.company.name, 'Spotify Launchpad');
  assert.match(analysis.icp.primary.name, /Independent and emerging artists/i);
  assert.ok(analysis.launch.checklist.length > 0);
  const visibleCopy = JSON.stringify({ overview: analysis.positioning, messaging: analysis.messaging, sales: analysis.sales });
  assert.doesNotMatch(visibleCopy, /\b(?:for for|manage run|coordinate run|around organize|organized around organize)\b/i);
  assert.doesNotMatch(analysis.positioning.category, /\b(?:for|inside|within|to|and)$/i);
  assert.match(analysis.sales.motion.openingQuestion, /\?$/);
});
