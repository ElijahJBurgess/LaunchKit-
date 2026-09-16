# Strategy Generation Quality Design

## Goal

Improve LaunchKit's strategy quality at the generation-contract level so onboarding answers are interpreted as source material and never mechanically pasted into finished marketing copy.

## Contract

- Add `positioning.headline` as an 8–16 word transformation headline used by Overview without truncation.
- Add `sales.motion` with `target`, `openingQuestion`, `value`, `reasonToBelieve`, and `callToAction`.
- Replace parallel sales objection arrays with `sales.objections: Array<{ objection, response }>`.
- Keep all existing sections and preserve one OpenAI Responses API call per full or section generation.

## Generation instructions

Create a shared `buildGenerationInstructions(section)` function. Every request receives global input/output separation, natural-language, evidence, repetition, and punctuation rules. Full generation appends every section rule; regeneration appends only the requested section rule. Schema field descriptions reinforce the same semantics.

## Validation

Validate JSON structure and deterministic semantic constraints using the original `BusinessInput`. Reject copied long input paragraphs, missing sales motion fields, oversized CTAs and ICP labels, malformed discovery questions, malformed punctuation, invalid objection pairs, and missing or oversized Overview headlines. Return the existing clean generation error rather than fabricating strategy.

## Mock strategy

Replace raw input concatenation with deterministic concept extraction. Normalize sentences, derive short labels and concepts, and compose output from those concepts. No product-specific branches or Spotify copy may be added.

## Presentation

Overview renders `positioning.headline` directly. Sales renders `sales.motion`, including `sales.motion.callToAction`. Objections render their paired responses. The sales image brief consumes the same motion and structured objections. Labels and values remain separate block elements with explicit spacing.

## Verification

Tests cover the contract, prompt parity, input-copy rejection, question and CTA guards, objection pairing, mock output, Overview mapping, Sales consumption, proof-point removal, and the visual brief. Run the full test suite and production build. A live Spotify generation is attempted only when a local OpenAI key is available.
