# LaunchKit

### AI Product Marketing Manager

**Turn business context into a structured, actionable go-to-market strategy.**

LaunchKit is an AI-assisted product marketing platform designed to turn raw business context into a structured PMM strategy across positioning, ICP, messaging, competitive analysis, launch planning, content, and sales enablement.

Rather than exposing users to a blank chatbot, LaunchKit treats AI as an application layer inside a guided product workflow:

**Business context → structured inputs → validated generation → PMM system → actionable outputs**

[Try LaunchKit →](https://launchkitpmm.vercel.app/)

---

## The Problem

Early-stage teams often understand what they are building before they understand how to position, message, launch, and sell it.

Those decisions are connected:

- Who is the ideal customer?
- What problem matters most to them?
- What category does the product compete in?
- Why should someone choose it?
- What should the company say?
- What channels should it use?
- What should happen before, during, and after launch?
- What should sales actually communicate?

General-purpose AI can answer each question individually, but that often creates a second problem: disconnected outputs with inconsistent assumptions and no shared structure.

LaunchKit approaches the problem as a product system rather than a collection of prompts.

The application captures business context once, converts it into a shared strategic model, and uses that model across the entire product marketing workflow.

---

# Product Philosophy

The core thesis behind LaunchKit is:

> **Better inputs lead to better strategy.**

The quality of AI output is constrained by the quality and structure of the context provided to it.

Instead of asking users to engineer their own prompts, LaunchKit uses guided onboarding to collect the information required for useful product marketing reasoning.

The current input model captures context such as:

- Business name
- Product description
- Target audience
- Customer problem
- Business goal
- Website
- Differentiation
- Competitors
- Additional context

The system then transforms those inputs into a defined PMM output contract.

---

# What LaunchKit Produces

The strategy model is intentionally broader than a single generated document.

LaunchKit's structured output currently covers:

### Company Context

- Company summary
- Product category

### Strategic Scorecard

- Overall readiness
- Market fit
- Messaging
- Differentiation
- ICP
- Launch readiness
- Positioning

Scores are explicitly treated as heuristic strategic indicators rather than measured business performance.

### Recommendations

- Top opportunity
- Biggest risk
- Recommended next move

### Ideal Customer Profile

Primary and secondary ICPs containing:

- Jobs to be done
- Pain points
- Motivations
- Buying triggers
- Objections
- Customer priorities

### Positioning

- Positioning statement
- Value proposition
- Elevator pitch
- Category
- Why now
- Differentiation

### Messaging

- Hero message
- Supporting messages
- Messaging pillars
- Feature → benefit → outcome mapping

### Competitive Strategy

- Competitor analysis
- Strengths
- Weaknesses
- Strategic opportunities
- SWOT
- Competitive takeaway

### Launch Strategy

LaunchKit models launch as three separate operating phases:

**Pre-launch → Launch → Post-launch**

Each phase can contain:

- Objective
- Channels
- Tactics
- KPI

The strategy also includes a primary KPI, secondary KPIs, and launch checklist.

### Content

Generated working drafts can include:

- Landing page
- Launch email
- LinkedIn copy
- Paid social
- Google Ads
- Press release
- Product Hunt copy

### Sales Enablement

- One-pager
- Battlecard
- Sales pitch
- Objections
- Objection handling
- Discovery questions

The result is designed to behave more like a lightweight PMM workspace than a single AI response.

---

# System Architecture

LaunchKit uses a deliberately small full-stack architecture.

The goal is to keep the system understandable and inexpensive while maintaining a clean boundary between UI, application state, AI orchestration, validation, and external model infrastructure.

```text
┌──────────────────────────────────────────────────────────────┐
│                         USER                                 │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  REACT + TYPESCRIPT CLIENT                   │
│                                                              │
│   Landing → Onboarding → Analysis → Workspace                │
│                                                              │
│   React Router                                               │
│   Central App State                                          │
│   Loading / Error States                                     │
│   Section Regeneration                                       │
│   Export / Visual Planning                                   │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                       PMM SERVICE                            │
│                                                              │
│                Runtime AI Mode Switch                        │
│                                                              │
│            ┌──────────────┴──────────────┐                   │
│            │                             │                   │
│            ▼                             ▼                   │
│      MOCK AI MODE                   LIVE AI MODE             │
│                                                              │
│  Deterministic local                 POST /api/generate      │
│  strategy generation                       │                 │
└─────────────────────────────────────────────┼────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       API BOUNDARY                           │
│                                                              │
│   Method validation                                          │
│   Input validation                                           │
│   Field length limits                                        │
│   Section validation                                         │
│   Error normalization                                        │
│   Cache-Control: no-store                                    │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                   AI ORCHESTRATION LAYER                    │
│                                                              │
│   Server-side API key                                        │
│   Model configuration                                        │
│   Prompt / instruction boundary                              │
│   Request timeout                                            │
│   Structured Outputs                                         │
│   Response parsing                                           │
│   Refusal handling                                           │
│   Schema validation                                          │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  OPENAI RESPONSES API                        │
│                                                              │
│                 Structured JSON Output                       │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    SHARED PMM SCHEMA                         │
│                                                              │
│      Server Validation ↔ Client Validation                   │
│                                                              │
│   Company │ ICP │ Positioning │ Messaging │ Competition      │
│   Launch  │ Content │ Sales │ Scores │ Recommendations       │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                       WORKSPACE                              │
│                                                              │
│       Review → Regenerate → Copy → Export → Execute          │
└──────────────────────────────────────────────────────────────┘
```

---

# Frontend Architecture

The client is built with:

- **React 18**
- **TypeScript**
- **Vite**
- **React Router**

The current application flow is:

```text
/
│
├── Landing
│
├── /onboarding
│      │
│      ├── Product
│      ├── Customer
│      └── Market
│
├── /analysis
│
└── /workspace
```

This separation keeps acquisition, input collection, generation state, and strategy consumption as distinct product states.

---

# Guided Input Architecture

Onboarding is implemented as a multi-step state machine rather than a single oversized form.

```text
STEP 1
Product Context
     │
     ▼
STEP 2
Customer Context
     │
     ▼
STEP 3
Market + Goal Context
     │
     ▼
Generate Strategy
```

Each stage has its own validation requirements before progression.

This is intentional UX architecture.

Instead of maximizing the amount of information collected per screen, the flow reduces cognitive load while progressively building the context object required by the strategy engine.

---

# Application State

LaunchKit maintains shared application state around two primary objects:

```text
BusinessInput
     │
     ▼
Generation
     │
     ▼
PMMAnalysis
```

The application state layer manages:

- Business input
- Generated analysis
- Loading state
- Generation errors
- Full analysis generation
- Individual section regeneration
- Reset behavior

A generation version is also maintained to prevent stale asynchronous responses from overwriting newer application state.

Conceptually:

```text
Request A ───────────────────────────► Response A
          Request B ───────► Response B

Current generation = B

Response B → accepted
Response A → ignored
```

This provides basic protection against race conditions created by overlapping generation requests.

---

# AI Service Abstraction

The React application does **not** communicate directly with OpenAI.

Instead:

```text
UI
 │
 ▼
pmmService
 │
 ├──────── Mock Mode
 │
 └──────── API Mode
              │
              ▼
        /api/generate
```

This abstraction gives LaunchKit two execution paths.

## Mock Mode

Mock mode generates representative PMM output locally.

It exists so that:

- The entire product can be developed without consuming API credits.
- UI development does not depend on model availability.
- Product flows remain testable without external infrastructure.
- Accidental addition of an API key cannot automatically trigger paid generation.

## Live Mode

When explicitly enabled, the service sends the business context to the backend generation endpoint.

The browser never needs direct access to the OpenAI API key.

---

# Backend Architecture

LaunchKit supports a lightweight Node/Express backend.

```text
Browser
   │
   │ POST /api/generate
   ▼
API Handler
   │
   ├── Validate method
   ├── Validate request body
   ├── Normalize business fields
   ├── Validate requested section
   │
   ▼
Generation Service
   │
   ▼
OpenAI Responses API
```

The Express server also serves the compiled frontend and provides SPA fallback routing.

The backend currently applies a **128 KB JSON body limit** and binds to localhost by default for local execution.

The code explicitly notes that public hosting requires additional authentication and usage controls.

That distinction is intentional: development infrastructure and production abuse prevention are separate concerns.

---

# API Contract

The primary generation endpoint is:

```http
POST /api/generate
Content-Type: application/json
```

Conceptually, the request looks like:

```json
{
  "input": {
    "businessName": "Example",
    "description": "What the product does",
    "targetAudience": "Who it serves",
    "customerProblem": "Problem being solved",
    "businessGoal": "Current objective",
    "website": "Optional",
    "differentiation": "Optional",
    "competitors": "Optional",
    "additionalContext": "Optional"
  }
}
```

The backend requires the core business fields and constrains accepted fields before they reach the model.

Individual fields are capped at **10,000 characters**.

Unknown generation sections are rejected.

---

# Structured AI Outputs

One of the most important architectural decisions in LaunchKit is that model output is **not treated as arbitrary text**.

The application defines a PMM schema shared across the generation and consumption layers.

```text
              PMM SCHEMA
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   AI Generation       Application
   Output Contract      Validation
```

The OpenAI request uses strict JSON Schema structured output.

That means the expected output shape is declared before generation.

The backend then independently validates the returned object before exposing it to the frontend.

The frontend validates the response again before accepting it.

```text
Model
  │
  ▼
JSON Schema Constraint
  │
  ▼
Server Validation
  │
  ▼
HTTP Response
  │
  ▼
Client Validation
  │
  ▼
Application State
```

This prevents the UI from depending on unpredictable free-form model output.

---

# Shared Schema

The shared PMM schema acts as a contract between:

```text
Frontend ↔ Backend ↔ Model
```

The complete analysis object contains defined structures for:

```text
PMMAnalysis
│
├── company
├── score
├── recommendations
├── icp
├── positioning
├── messaging
├── competition
├── launch
├── content
└── sales
```

Nested objects and arrays are validated recursively.

Objects reject unexpected properties and require their declared fields.

This makes AI output behave more like data returned from a conventional application service.

---

# Section-Level Regeneration

LaunchKit does not require regenerating an entire strategy when the user wants to rethink one component.

The API accepts an optional strategy section:

```json
{
  "input": {},
  "section": "messaging"
}
```

The schema system then derives a section-specific contract.

Conceptually:

```text
Full Strategy
│
├── ICP
├── Positioning
├── Messaging ◄──── Regenerate only this
├── Competition
├── Launch
├── Content
└── Sales
```

The client merges the regenerated section back into the existing strategy.

This reduces unnecessary generation and creates a more useful editing model than repeatedly regenerating the entire artifact.

---

# AI Safety & Reliability Boundaries

LaunchKit treats model output as untrusted external data.

Several controls exist around generation.

### Server-side credentials

`OPENAI_API_KEY` is read only on the server.

It is not intentionally exposed through the browser bundle.

### Explicit live-mode switch

Live generation requires mock mode to be explicitly disabled.

```text
VITE_USE_MOCK_AI=false
```

Adding an API key alone is therefore not enough to trigger paid requests.

### Structured output

Responses must conform to the declared PMM schema.

### Response validation

Generated data is validated after parsing before entering application state.

### Timeouts

The OpenAI request has a server timeout, while the frontend also maintains its own request timeout.

This prevents indefinite generation states.

### HTTP error normalization

LaunchKit distinguishes several failure modes, including:

- Missing API configuration
- Invalid API credentials
- Rate/usage limits
- Model timeout
- Refusal
- Invalid JSON
- Incomplete structured data
- General upstream failure

### No response storage

OpenAI requests currently specify:

```text
store: false
```

### Prompt-boundary instruction

Business information is explicitly treated as **data rather than instructions** in the model instruction layer.

The generation instructions also tell the model not to:

- Pretend it visited websites
- Present unverified competitor information as fact
- Invent testimonials
- Invent verified metrics

Assumptions and unverified claims should instead be identified as such.

---

# Generation Lifecycle

A complete live generation follows this path:

```text
1. User completes onboarding
            │
            ▼
2. BusinessInput enters AppState
            │
            ▼
3. pmmService selects execution mode
            │
            ▼
4. POST /api/generate
            │
            ▼
5. API validates request
            │
            ▼
6. Server constructs generation request
            │
            ▼
7. OpenAI Responses API
            │
            ▼
8. Model constrained by PMM JSON Schema
            │
            ▼
9. Server parses response
            │
            ▼
10. Server validates PMM payload
            │
            ▼
11. Client receives JSON
            │
            ▼
12. Client validates payload again
            │
            ▼
13. AppState stores analysis
            │
            ▼
14. Workspace renders strategy
```

---

# Why This Architecture?

LaunchKit could have been implemented as:

```text
textarea → prompt → giant string → screen
```

It deliberately is not.

The architecture separates five responsibilities:

```text
┌─────────────────────┐
│ PRODUCT EXPERIENCE  │
│ React / UX           │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ APPLICATION STATE   │
│ Inputs + analysis   │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ SERVICE LAYER       │
│ Mock / live routing │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ API / ORCHESTRATION │
│ Security + model    │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ DATA CONTRACT       │
│ PMM schema          │
└─────────────────────┘
```

That separation makes it easier to change:

- The frontend without rewriting model infrastructure
- The model without rewriting the UI
- Prompts without changing application state
- Individual PMM modules without rebuilding the entire strategy
- Mock/live execution without maintaining separate applications

---

# Repository Structure

```text
LaunchKit/
│
├── api/
│   ├── generate.js
│   └── generate-visual.js
│
├── lib/
│   ├── openai.js
│   └── visuals.js
│
├── shared/
│   ├── pmmSchema.js
│   └── pmmSchema.d.ts
│
├── src/
│   │
│   ├── components/
│   │
│   ├── data/
│   │   ├── exampleBusiness.ts
│   │   └── mockPMMAnalysis.ts
│   │
│   ├── lib/
│   │   ├── export.ts
│   │   ├── loadingProgress.ts
│   │   └── visualPlan.ts
│   │
│   ├──
