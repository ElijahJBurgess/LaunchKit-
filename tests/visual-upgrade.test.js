import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { readFile } from 'node:fs/promises';

const viteConfig = { server: { middlewareMode: true, hmr: false }, appType: 'custom' };

test('workspace header hides the export control', async () => {
  const source = await readFile(new URL('../src/pages/workspace/Workspace.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, />\s*Export\s*▾\s*</);
  assert.doesNotMatch(source, /export-dropdown/);
});

const business = {
  businessName: 'Fernpath',
  description: 'A client review workspace for creative teams',
  targetAudience: 'Creative agencies and small design teams',
  customerProblem: 'Client feedback is scattered across email and chat',
  differentiation: 'Client approvals are part of the core workflow',
  competitors: 'Asana, Notion',
  businessGoal: 'Acquire Customers',
  additionalContext: 'Launching in six weeks',
};

async function loadFixture() {
  const vite = await createServer(viteConfig);
  const { generateMockAnalysis } = await vite.ssrLoadModule('/src/data/mockPMMAnalysis.ts');
  const analysis = generateMockAnalysis(business);
  await vite.close();
  return analysis;
}

function responseHarness() {
  return {
    code: 200,
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.code = code; return this; },
    json(data) { this.data = data; return this; },
    end() {},
  };
}

test('strategy contract omits proof points everywhere', async () => {
  const { analysisSchema, isAnalysisPayload } = await import('../shared/pmmSchema.js');
  const analysis = await loadFixture();
  assert.equal(Object.hasOwn(analysis.messaging, 'proofPoints'), false);
  assert.equal(Object.hasOwn(analysisSchema.properties.messaging.properties, 'proofPoints'), false);
  assert.equal(isAnalysisPayload(analysis), true);
});

test('elapsed progress remains below 100 until success and keeps moving after two minutes', async () => {
  const vite = await createServer(viteConfig);
  try {
    const { progressAt, loadingCopyAt } = await vite.ssrLoadModule('/src/lib/loadingProgress.ts');
    assert.equal(progressAt(0), 8);
    assert.equal(progressAt(15_000), 20);
    assert.equal(progressAt(55_000), 50);
    assert.equal(progressAt(115_000), 94);
    assert.ok(progressAt(180_000) > progressAt(120_000));
    assert.ok(progressAt(600_000) < 99);
    assert.equal(loadingCopyAt(5_000), 'Understanding your business…');
    assert.equal(loadingCopyAt(45_000), 'Connecting your audience, positioning, and messaging…');
    assert.equal(loadingCopyAt(80_000), 'Building your go-to-market plan…');
    assert.equal(loadingCopyAt(110_000), 'Finishing your strategy…');
  } finally { await vite.close(); }
});

test('visual plan maps the real strategy into blueprint, actions, roadmap, and metrics', async () => {
  const analysis = await loadFixture();
  const vite = await createServer(viteConfig);
  const { buildVisualPlan } = await vite.ssrLoadModule('/src/lib/visualPlan.ts');
  const plan = buildVisualPlan(analysis);
  assert.equal(plan.headline, analysis.positioning.headline);
  assert.doesNotMatch(plan.headline, /…|\.\.\./);
  assert.equal(plan.blueprint.audience, analysis.icp.primary.name);
  assert.equal(plan.blueprint.problem, analysis.icp.primary.painPoints[0]);
  assert.ok(analysis.positioning.statement.startsWith(plan.blueprint.positioning.slice(0, -1)));
  assert.ok(plan.blueprint.positioning.length <= 180);
  assert.equal(plan.blueprint.message, analysis.messaging.hero);
  assert.deepEqual(plan.blueprint.channels, analysis.launch.preLaunch.channels.slice(0, 3));
  assert.equal(plan.actions.length, Math.min(7, analysis.launch.checklist.length));
  assert.deepEqual(plan.actions.map((action) => action.text), analysis.launch.checklist.slice(0, 7));
  assert.deepEqual(plan.roadmap.map((phase) => phase.range), ['Days 0–30', 'Days 31–60', 'Days 61–90']);
  assert.equal(plan.metrics.primary, analysis.launch.primaryKPI);
  assert.deepEqual(plan.metrics.watch, analysis.launch.secondaryKPIs.slice(0, 3));
  await vite.close();
});

test('sales visual brief uses the explicit motion and paired objections', async () => {
  const analysis = await loadFixture();
  analysis.sales.pitch = 'Pitch marker that must not become the CTA.';
  const vite = await createServer(viteConfig);
  try {
    const { buildVisualBrief } = await vite.ssrLoadModule('/src/services/visualService.ts');
    const brief = buildVisualBrief('sales', analysis);
    assert.equal(brief.target, analysis.sales.motion.target);
    assert.equal(brief.value, analysis.sales.motion.value);
    assert.equal(brief.cta, analysis.sales.motion.callToAction);
    assert.notEqual(brief.cta, analysis.sales.pitch);
    assert.deepEqual(brief.objections, analysis.sales.objections.slice(0, 3));
  } finally { await vite.close(); }
});

test('visual plan shortens display copy without mutating the source strategy', async () => {
  const analysis = await loadFixture();
  const original = structuredClone(analysis);
  analysis.positioning.statement = `${'A precise strategic position '.repeat(20)}final thought.`;
  const vite = await createServer(viteConfig);
  const { buildVisualPlan } = await vite.ssrLoadModule('/src/lib/visualPlan.ts');
  const plan = buildVisualPlan(analysis);
  assert.ok(plan.blueprint.positioning.length <= 180);
  assert.match(plan.blueprint.positioning, /…$/);
  assert.equal(original.company.name, analysis.company.name);
  assert.ok(analysis.positioning.statement.length > plan.blueprint.positioning.length);
  await vite.close();
});

test('workspace tab contract places Visuals immediately after Sales', async () => {
  const vite = await createServer(viteConfig);
  try {
    const { WORKSPACE_TABS, WORKSPACE_TAB_LABELS } = await vite.ssrLoadModule('/src/types/pmm.ts');
    assert.deepEqual(WORKSPACE_TABS.slice(-2), ['sales', 'visuals']);
    assert.equal(WORKSPACE_TAB_LABELS.visuals, 'Visuals');
  } finally { await vite.close(); }
});

test('visual route rejects invalid requests before any image call', async () => {
  const { default: handler } = await import('../api/generate-visual.js');
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Unexpected network request'); };
  try {
    for (const body of [{}, { type: 'unknown', brief: {} }, { type: 'strategy', brief: { audience: 42 } }]) {
      const res = responseHarness();
      await handler({ method: 'POST', body }, res);
      assert.equal(res.code, 400);
    }
  } finally { globalThis.fetch = originalFetch; }
});

test('visual route blocks image calls in mock mode', async () => {
  const { default: handler } = await import('../api/generate-visual.js');
  const old = { ...process.env };
  const originalFetch = globalThis.fetch;
  delete process.env.VITE_USE_MOCK_AI;
  process.env.OPENAI_API_KEY = 'test-only';
  globalThis.fetch = () => { throw new Error('Unexpected network request'); };
  try {
    const res = responseHarness();
    await handler({ method: 'POST', body: { type: 'strategy', brief: { company: 'Acme', audience: 'Teams', problem: 'Slow work', positioning: 'Fast planning', message: 'Move faster', channels: ['Email'], launch: 'Pilot', success: 'Signups' } } }, res);
    assert.equal(res.code, 409);
  } finally { process.env = old; globalThis.fetch = originalFetch; }
});

test('one valid visual request makes one server-side image call and returns browser-ready data', async () => {
  const { default: handler } = await import('../api/generate-visual.js');
  const old = { ...process.env };
  const originalFetch = globalThis.fetch;
  process.env.VITE_USE_MOCK_AI = 'false';
  process.env.OPENAI_API_KEY = 'server-secret';
  process.env.OPENAI_IMAGE_MODEL = 'configured-image-model';
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls += 1;
    assert.equal(url, 'https://api.openai.com/v1/images/generations');
    assert.equal(options.headers.Authorization, 'Bearer server-secret');
    const payload = JSON.parse(options.body);
    assert.equal(payload.model, 'configured-image-model');
    assert.equal(payload.n, 1);
    assert.equal(payload.size, '1536x1024');
    assert.match(payload.prompt, /green.*white.*black/i);
    return new Response(JSON.stringify({ data: [{ b64_json: 'aGVsbG8=' }], output_format: 'webp' }), { status: 200 });
  };
  try {
    const res = responseHarness();
    await handler({ method: 'POST', body: { type: 'marketing', brief: { company: 'Acme', audience: 'Teams', message: 'Move faster', purpose: 'Launch announcement', cta: 'Try Acme' } } }, res);
    assert.equal(res.code, 200);
    assert.equal(calls, 1);
    assert.equal(res.data.imageUrl, 'data:image/webp;base64,aGVsbG8=');
    assert.doesNotMatch(JSON.stringify(res.data), /server-secret/);
  } finally { process.env = old; globalThis.fetch = originalFetch; }
});

test('image provider errors stay isolated and never expose provider bodies or keys', async () => {
  const { default: handler } = await import('../api/generate-visual.js');
  const old = { ...process.env };
  const originalFetch = globalThis.fetch;
  process.env.VITE_USE_MOCK_AI = 'false';
  process.env.OPENAI_API_KEY = 'server-secret';
  globalThis.fetch = async () => new Response('private upstream detail', { status: 429 });
  try {
    const res = responseHarness();
    await handler({ method: 'POST', body: { type: 'marketing', brief: { company: 'Acme', audience: 'Teams', message: 'Move faster', purpose: 'Launch', cta: 'Try it' } } }, res);
    assert.equal(res.code, 429);
    assert.doesNotMatch(res.data.error, /private upstream detail|server-secret/);
  } finally { process.env = old; globalThis.fetch = originalFetch; }
});
