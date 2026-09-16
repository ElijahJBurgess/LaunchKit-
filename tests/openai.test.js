import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

// Tests replace only outbound HTTP; no provider requests or real credentials.
const input = { businessName: 'Acme', description: 'Planning software', targetAudience: 'Small teams', customerProblem: 'Scattered tasks', businessGoal: 'Acquire Customers' };
const company = { name: 'Acme', summary: 'Planning for small teams', category: 'Productivity' };
const sales = {
  motion: {
    target: 'Small teams managing complex plans',
    openingQuestion: 'How do you coordinate the work today?',
    value: 'Bring strategy, ownership, and execution into one guided plan.',
    reasonToBelieve: 'The workflow connects strategic direction directly to the next action.',
    callToAction: 'Build your next plan.',
  },
  discoveryQuestions: ['How do you coordinate the work today?', 'Where does the process create the most friction?', 'What would a better outcome look like?'],
  objections: [{ objection: 'We already have a planning tool.', response: 'Compare how the guided workflow connects strategy and execution without rebuilding the process.' }],
  onePager: 'Acme helps small teams connect strategy, ownership, and execution in one guided plan. Build your next plan.',
  battlecard: 'Generic planning tools are flexible. Position Acme around a guided workflow that connects strategic direction to the next action.',
  pitch: 'Planning often separates strategy from execution. Acme brings both into one guided workflow for small teams. See how it could support your next plan.',
};
const response = (payload, status = 'completed') => new Response(JSON.stringify({
  id: 'resp_test', object: 'response', status,
  output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: JSON.stringify(payload) }] }],
}), { status: 200 });

async function handlerRequest(body, env, fetchImpl) {
  const { default: handler } = await import('../api/generate.js');
  const old = { ...process.env };
  const originalFetch = globalThis.fetch;
  delete process.env.VITE_USE_MOCK_AI;
  delete process.env.OPENAI_API_KEY;
  Object.assign(process.env, env);
  globalThis.fetch = fetchImpl || (() => { throw new Error('Unexpected network request'); });
  const res = { code: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; }, end() {} };
  try { await handler({ method: 'POST', body }, res); return res; }
  finally { process.env = old; globalThis.fetch = originalFetch; }
}

test('default mock mode blocks provider calls even when a key is configured', async () => {
  const res = await handlerRequest({ input }, { OPENAI_API_KEY: 'test-only' });
  assert.equal(res.code, 409);
});

test('live mode without a key returns an actionable configuration error', async () => {
  const res = await handlerRequest({ input }, { VITE_USE_MOCK_AI: 'false' });
  assert.equal(res.code, 503);
  assert.match(res.data.error, /OPENAI_API_KEY/);
});

test('valid section request reaches Responses API with server credentials and strict schema', async () => {
  const res = await handlerRequest({ input, section: 'company' }, { VITE_USE_MOCK_AI: 'false', OPENAI_API_KEY: 'test-only', OPENAI_MODEL: 'configured-model' }, async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    assert.equal(options.headers.Authorization, 'Bearer test-only');
    const body = JSON.parse(options.body);
    assert.equal(body.model, 'configured-model');
    assert.equal(body.store, false);
    assert.equal(body.text.format.type, 'json_schema');
    assert.equal(body.text.format.strict, true);
    assert.deepEqual(Object.keys(body.text.format.schema.properties), ['company']);
    assert.match(body.instructions, /source material, not finished marketing copy/i);
    assert.match(body.instructions, /COMPANY AND EXECUTIVE SUMMARY/);
    assert.doesNotMatch(body.instructions, /SALES MOTION AND ENABLEMENT/);
    assert.match(body.input, /Acme/);
    return response({ company });
  });
  assert.equal(res.code, 200);
  assert.deepEqual(res.data, { company });
});

test('sales regeneration receives the shared global rules and sales-specific contract', async () => {
  const res = await handlerRequest({ input, section: 'sales' }, { VITE_USE_MOCK_AI: 'false', OPENAI_API_KEY: 'test-only' }, async (_url, options) => {
    const body = JSON.parse(options.body);
    assert.match(body.instructions, /source material, not finished marketing copy/i);
    assert.match(body.instructions, /SALES MOTION AND ENABLEMENT/);
    assert.doesNotMatch(body.instructions, /MESSAGING\n/);
    assert.deepEqual(Object.keys(body.text.format.schema.properties), ['sales']);
    return response({ sales });
  });
  assert.equal(res.code, 200);
  assert.deepEqual(res.data, { sales });
});

test('invalid input and unknown section are rejected before any provider call', async () => {
  for (const body of [{ input: {} }, { input, section: '__proto__' }, { input, section: null }, { input: { ...input, description: 42 } }]) {
    const res = await handlerRequest(body, { VITE_USE_MOCK_AI: 'false', OPENAI_API_KEY: 'test-only' });
    assert.equal(res.code, 400);
  }
});

test('incomplete and malformed provider data never reach workspace as valid results', async () => {
  for (const result of [response({ company }, 'incomplete'), response({ company: { name: 'Acme' } }), response({ company: { ...company, category: 42 } })]) {
    const res = await handlerRequest({ input, section: 'company' }, { VITE_USE_MOCK_AI: 'false', OPENAI_API_KEY: 'test-only' }, async () => result);
    assert.equal(res.code, 502);
  }
});

test('upstream failures do not expose provider response bodies or secrets', async () => {
  const res = await handlerRequest({ input }, { VITE_USE_MOCK_AI: 'false', OPENAI_API_KEY: 'test-only' }, async () => new Response('secret-provider-detail', { status: 429 }));
  assert.equal(res.code, 429);
  assert.doesNotMatch(res.data.error, /secret-provider-detail|test-only/);
});

test('frontend live generation and regeneration send business input and surface errors', async () => {
  const vite = await createServer({ server: { middlewareMode: true }, define: { 'import.meta.env.VITE_USE_MOCK_AI': '"false"' } });
  const originalFetch = globalThis.fetch;
  try {
    const service = await vite.ssrLoadModule('/src/services/pmmService.ts');
    const { generateMockAnalysis } = await vite.ssrLoadModule('/src/data/mockPMMAnalysis.ts');
    const fixture = generateMockAnalysis(input);
    globalThis.fetch = async (url, options) => {
      assert.equal(url, '/api/generate');
      assert.deepEqual(JSON.parse(options.body), { input });
      return new Response(JSON.stringify(fixture));
    };
    assert.deepEqual(await service.generatePMMAnalysis(input), fixture);
    const semanticallyInvalid = structuredClone(fixture);
    semanticallyInvalid.sales.motion.callToAction = semanticallyInvalid.sales.pitch;
    globalThis.fetch = async () => new Response(JSON.stringify(semanticallyInvalid));
    await assert.rejects(service.generatePMMAnalysis(input), /invalid|incomplete|quality/i);
    globalThis.fetch = async (url, options) => {
      assert.deepEqual(JSON.parse(options.body), { input, section: 'company' });
      return new Response(JSON.stringify({ company }));
    };
    assert.deepEqual(await service.regeneratePMMSection(input, 'company'), company);
    globalThis.fetch = async () => new Response(JSON.stringify({ error: 'Add your key' }), { status: 503 });
    await assert.rejects(service.generatePMMAnalysis(input), /Add your key/);
    globalThis.fetch = async () => new Response(JSON.stringify({ company }));
    await assert.rejects(service.generatePMMAnalysis(input), /invalid|incomplete/i);
  } finally { globalThis.fetch = originalFetch; await vite.close(); }
});

test('frontend default mock generation and regeneration never call fetch', async () => {
  const vite = await createServer({ server: { middlewareMode: true }, define: { 'import.meta.env.VITE_USE_MOCK_AI': 'undefined' } });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Unexpected network request'); };
  try {
    const service = await vite.ssrLoadModule('/src/services/pmmService.ts');
    assert.equal(service.isMockMode(), true);
    assert.equal((await service.generatePMMAnalysis(input)).company.name, 'Acme');
    assert.equal((await service.regeneratePMMSection(input, 'company')).name, 'Acme');
  } finally { globalThis.fetch = originalFetch; await vite.close(); }
});

test('complete provider response matches the existing workspace data contract', async () => {
  const vite = await createServer({ server: { middlewareMode: true } });
  try {
    const { generateMockAnalysis } = await vite.ssrLoadModule('/src/data/mockPMMAnalysis.ts');
    const fixture = generateMockAnalysis(input);
    const res = await handlerRequest({ input }, { VITE_USE_MOCK_AI: 'false', OPENAI_API_KEY: 'test-only' }, async (_url, options) => {
      const body = JSON.parse(options.body);
      const schema = body.text.format.schema;
      assert.deepEqual(Object.keys(schema.properties).sort(), ['company', 'competition', 'content', 'icp', 'launch', 'messaging', 'positioning', 'recommendations', 'sales', 'score']);
      assert.match(body.instructions, /POSITIONING\n/);
      assert.match(body.instructions, /SALES MOTION AND ENABLEMENT/);
      return response(fixture);
    });
    assert.equal(res.code, 200);
    assert.deepEqual(res.data, fixture);
    fixture.score.overall = 101;
    const invalid = await handlerRequest({ input }, { VITE_USE_MOCK_AI: 'false', OPENAI_API_KEY: 'test-only' }, async () => response(fixture));
    assert.equal(invalid.code, 502);
  } finally { await vite.close(); }
});

test('refusals, invalid keys and timeouts return usable errors', async () => {
  const scenarios = [
    [async () => new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'Refused' }] }] })), 422],
    [async () => new Response('private error body', { status: 401 }), 503],
    [async () => { throw new DOMException('Timed out', 'TimeoutError'); }, 504],
  ];
  for (const [fetchImpl, status] of scenarios) {
    const res = await handlerRequest({ input }, { VITE_USE_MOCK_AI: 'false', OPENAI_API_KEY: 'test-only' }, fetchImpl);
    assert.equal(res.code, status);
    assert.equal(typeof res.data.error, 'string');
    assert.doesNotMatch(res.data.error, /private error body/);
  }
});
