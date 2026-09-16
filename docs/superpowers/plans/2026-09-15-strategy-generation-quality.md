# Strategy Generation Quality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate concise, natural, semantically valid LaunchKit strategies from arbitrary onboarding input without copying raw paragraphs into output copy.

**Architecture:** A shared instruction builder and described JSON schema define the model contract. Input-aware deterministic validation protects the server and browser boundary, while the mock generator derives bounded concepts before composing strategy text. UI and image briefs consume the explicit presentation fields.

**Tech Stack:** Node.js, React, TypeScript, Vite, Node test runner, OpenAI Responses API Structured Outputs

**Spec:** `docs/superpowers/specs/2026-09-15-strategy-generation-quality-design.md`

## Global Constraints

- Work directly on `main` and preserve the current OpenAI Responses API pipeline.
- Do not add Spotify-specific conditions or copy.
- Keep one provider call per generation or regeneration.
- Use `positioning.headline` and `sales.motion.callToAction` as the presentation sources.
- Commit once with `fix: improve LaunchKit strategy generation quality` and push `origin/main`.

---

### Task 1: Define and test the semantic contract

**Files:**
- Create: `tests/strategy-quality.test.js`
- Modify: `shared/pmmSchema.js`
- Modify: `src/types/pmm.ts`

**Interfaces:**
- Produces: `validateAnalysisPayload(value, input, section)`, `assertAnalysisPayload(value, input, section)`, and the updated `PMMAnalysis` contract.

- [ ] Write failing tests that require `positioning.headline`, `sales.motion`, structured objections, exactly three discovery questions, sane CTA and ICP lengths, question punctuation, and raw paragraph rejection.
- [ ] Run `node --test tests/strategy-quality.test.js` and confirm failures reflect the old contract.
- [ ] Add described schema fields and input-aware deterministic validation.
- [ ] Re-run the focused test and keep it green.

### Task 2: Build and test shared generation instructions

**Files:**
- Create: `lib/generationInstructions.js`
- Modify: `lib/openai.js`
- Modify: `tests/openai.test.js`

**Interfaces:**
- Produces: `buildGenerationInstructions(section?: string): string`.
- Consumes: `validateAnalysisPayload(result, input, section)` from Task 1.

- [ ] Add failing assertions proving full and Sales regeneration share the global rules and receive their relevant section rules.
- [ ] Run the OpenAI tests and confirm the missing builder causes failure.
- [ ] Implement global and section instruction blocks and use them in the existing single Responses API request.
- [ ] Pass original input into post-response semantic validation and return the existing clean error for violations.
- [ ] Re-run the OpenAI tests.

### Task 3: Refactor mock generation around concepts

**Files:**
- Modify: `src/data/mockPMMAnalysis.ts`
- Modify: `tests/strategy-quality.test.js`

**Interfaces:**
- Produces: a complete `PMMAnalysis` satisfying the updated schema for arbitrary `BusinessInput`.

- [ ] Add a failing long-paragraph fixture proving mock output does not contain complete raw audience, problem, differentiation, competitor, or context paragraphs.
- [ ] Replace direct raw-field templates with normalized sentence, label, concept, and alternative extraction helpers.
- [ ] Generate the headline, sales motion, objection pairs, three discovery questions, one-pager, battlecard, and pitch from concise concepts.
- [ ] Run focused semantic and existing example tests.

### Task 4: Update presentation consumers

**Files:**
- Modify: `src/lib/visualPlan.ts`
- Modify: `src/pages/workspace/tabs/Sales.tsx`
- Modify: `src/services/visualService.ts`
- Modify: `src/pages/workspace/tabs/tabs.css`
- Modify: `tests/visual-upgrade.test.js`
- Modify: `tests/strategy-quality.test.js`

**Interfaces:**
- Consumes: `positioning.headline`, `sales.motion`, and `sales.objections`.

- [ ] Add failing assertions that Overview uses the generated headline without ellipsis and both Sales and visual briefs use `sales.motion.callToAction` rather than `sales.pitch`.
- [ ] Render Sales steps from explicit motion fields and paired objections.
- [ ] Build the sales visual brief from the same fields and increase label/value block spacing.
- [ ] Run focused visual tests.

### Task 5: Full verification and delivery

**Files:**
- Modify tests only if a verified regression exposes a missing contract case.

**Interfaces:**
- Produces: verified commit on `origin/main`.

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Inspect mock Spotify output section by section and regenerate Sales through the normal pipeline.
- [ ] If `OPENAI_API_KEY` is available, run the same review in live mode; otherwise report that as the sole remaining validation.
- [ ] Confirm `git diff --check`, no secret/local files are tracked, and only intended changes remain.
- [ ] Commit with `fix: improve LaunchKit strategy generation quality` and push `origin/main`.
