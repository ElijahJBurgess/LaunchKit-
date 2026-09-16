import type { BusinessInput } from '../types/business';
import type { PMMAnalysis } from '../types/pmm';

function splitList(value: string | undefined, fallback: string[]): string[] {
  if (!value || !value.trim()) return fallback;
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function firstSentence(text: string): string {
  const trimmed = (text || '').trim();
  const match = trimmed.match(/^[^.!?]*[.!?]/);
  return (match ? match[0] : trimmed).trim();
}

/** Lowercases the first letter (keeps everything else, including trailing punctuation, as-is). */
function lowerFirst(text: string): string {
  const t = text || 'this product';
  return t.charAt(0).toLowerCase() + t.slice(1);
}

/**
 * Lowercases the first letter AND strips trailing sentence punctuation —
 * safe to embed mid-sentence (e.g. followed by a comma, dash, or "and ...").
 */
function midClause(text: string): string {
  const t = (text || '').trim().replace(/[.!?]+$/, '');
  if (!t) return t;
  return t.charAt(0).toLowerCase() + t.slice(1);
}

/** A short label (a few words), not a full sentence — used for "category" fields. */
function shortCategory(description: string): string {
  const sentence = firstSentence(description)
    .replace(/\.$/, '')
    .replace(/^(a|an|the)\s+/i, '');
  const cut = sentence.split(/,| built | designed | made | that | for /i)[0];
  const words = cut.trim().split(/\s+/).filter(Boolean).slice(0, 6);
  return words.join(' ');
}

function clamp(n: number, min = 40, max = 98): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/**
 * Deterministic pseudo-variance so repeated fields don't all land on
 * identical scores, without pulling in a real RNG dependency.
 */
function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function generateMockAnalysis(input: BusinessInput): PMMAnalysis {
  const name = input.businessName.trim() || 'Your product';
  const description = input.description.trim() || 'a new product finding its footing';
  const audience = input.targetAudience.trim() || 'early adopters who feel the problem most acutely';
  const problem = input.customerProblem.trim() || 'the tools they use today are slow, generic, or not built for this specific job';
  const differentiation = input.differentiation?.trim();
  const goal = input.businessGoal || 'Acquire Customers';
  const additional = input.additionalContext?.trim();

  const competitorNames = splitList(input.competitors, ['an established incumbent', 'a DIY spreadsheet-and-Slack workflow', 'a cheaper, more generic tool']);
  const seed = hashSeed(name + description + audience);
  const completeness =
    (differentiation ? 6 : 0) + (input.competitors ? 5 : 0) + (additional ? 4 : 0) + (input.website ? 3 : 0);

  const overall = clamp(68 + completeness + (seed % 15));
  const marketFit = clamp(overall - 4 + (seed % 7));
  const messaging = clamp(overall - 2 + ((seed >> 2) % 9));
  const diffScore = clamp(overall + (differentiation ? 6 : -6) + ((seed >> 4) % 7));
  const icpScore = clamp(overall + 5 + ((seed >> 6) % 6));
  const launchReadiness = clamp(overall - 10 + ((seed >> 8) % 8));
  const positioningScore = clamp(overall + 2 + ((seed >> 10) % 6));

  const category = shortCategory(description) || `${name}'s category`;

  const diffLine = differentiation
    ? differentiation
    : `a sharper focus on ${audience.split(',')[0] || 'its core audience'} than broader, do-everything tools attempt`;

  const primaryCompetitor = competitorNames[0];

  return {
    company: {
      name,
      summary: `${name} is ${lowerFirst(description)}${description.trim().endsWith('.') ? '' : '.'} The product is still early, but the wedge — ${midClause(diffLine)} — is clear enough to build a go-to-market plan around.`,
      category,
    },

    score: {
      overall,
      marketFit,
      messaging,
      differentiation: diffScore,
      icp: icpScore,
      launchReadiness,
      positioning: positioningScore,
    },

    recommendations: {
      topOpportunity: `${name} has an opportunity to own ${problem.toLowerCase().startsWith('the') ? midClause(problem) : 'the moment where ' + midClause(problem)} — that's underserved by ${primaryCompetitor}, and it maps directly to why ${audience.split(',')[0] || 'your core buyer'} would switch.`,
      biggestRisk: `Without a sharp wedge in the first sentence of every page, ${name} risks blending into "yet another tool" territory next to ${primaryCompetitor} — the differentiation is real but has to be said out loud, every time.`,
      nextMove: `Ship one landing page and one outbound message built entirely around "${midClause(diffLine)}," and get it in front of ${audience.split(',')[0] || 'your target users'} before broadening the pitch.`,
    },

    icp: {
      primary: {
        name: audience.split(',')[0]?.trim() || 'Primary buyer',
        who: `${audience}. They're evaluating tools right now because ${problem.charAt(0).toLowerCase()}${problem.slice(1)}`,
        jobsToBeDone: [
          `Get ${category.trim() || 'this problem'} handled without adding another sprawling tool to the stack`,
          `Show progress to a boss, client, or teammate quickly`,
        ],
        painPoints: [
          problem,
          `Existing options like ${primaryCompetitor} require workarounds to do the one thing ${name} does natively`,
        ],
        motivations: [
          `Look competent and organized in front of the people they answer to`,
          `Spend less time on the mechanics of the work and more on the work itself`,
        ],
        buyingTriggers: [
          `A visible failure caused by the current process (a missed deadline, a dropped detail, an embarrassing mistake)`,
          `Onboarding a new project, client, or team that raises the stakes of staying disorganized`,
        ],
        objections: [
          `"We already have a tool that sort of does this"`,
          `"Is this actually different, or just a reskin of ${primaryCompetitor}?"`,
        ],
        whatTheyCareAbout: [`Speed to value`, `Not having to convince a whole team to switch`, `Clear, honest pricing`],
      },
      secondary: {
        name: `Adjacent buyer`,
        who: `A less central but still viable audience: people adjacent to ${audience.split(',')[0] || 'the primary buyer'} who feel the same problem at smaller scale.`,
        jobsToBeDone: [`Solve a lighter-weight version of the same problem without enterprise overhead`],
        painPoints: [`Most tools in this space are priced and built for bigger teams than theirs`],
        motivations: [`Punch above their weight without hiring a bigger team`],
        buyingTriggers: [`Outgrowing a spreadsheet, doc, or manual process that used to be "good enough"`],
        objections: [`Price sensitivity relative to a small team's budget`, `"Will I actually use all of this?"`],
        whatTheyCareAbout: [`Simplicity over feature count`, `A tool that scales with them, not past them`],
      },
    },

    positioning: {
      statement: `For ${audience.split(',')[0]?.trim() || 'teams who feel this problem'}, ${name} is a ${category || 'product'} built to solve "${firstSentence(problem).replace(/\.$/, '')}" — unlike ${primaryCompetitor}, which wasn't built for this specific job.`,
      valueProposition: `${name} turns "${problem}" into a solved problem — built specifically for ${audience.split(',')[0]?.trim() || 'the people who deal with this daily'}, not retrofitted from a broader tool.`,
      elevatorPitch: `${name} is ${lowerFirst(description)} We built it because ${midClause(problem)}, and nothing on the market — including ${primaryCompetitor} — treats that as the core problem instead of an edge case.`,
      category,
      differentiation: [
        diffLine,
        `Purpose-built for ${audience.split(',')[0]?.trim() || 'this specific audience'} instead of generalized for everyone`,
        `Faster time-to-value than switching an entire team onto ${primaryCompetitor}`,
      ],
      whyNow: `${audience.split(',')[0]?.trim() || 'This audience'} is actively re-evaluating their tools this year, and the gap ${name} fills — ${midClause(problem)} — has only gotten more visible as teams do more with less.`,
    },

    messaging: {
      hero: `${firstSentence(description).replace(/\.$/, '') || name}. Built for ${audience.split(',')[0]?.trim() || 'people who need it to just work'}.`,
      supportingMessages: [
        `Solves ${midClause(problem)} — not a symptom of it.`,
        `Set up in minutes, not a quarter-long rollout.`,
        `Built for ${audience.split(',')[0]?.trim() || 'your team'}, not retrofitted from an enterprise suite.`,
      ],
      pillars: [`Purpose-built, not general-purpose`, `Fast time-to-value`, `Honest, transparent pricing`],
      featureBenefits: [
        {
          feature: firstSentence(description).replace(/\.$/, '') || `${name}'s core workflow`,
          benefit: `${audience.split(',')[0]?.trim() || 'Your team'} gets this handled without extra tooling overhead`,
          outcome: `Less time spent managing the process, more time spent on the actual work`,
        },
        {
          feature: `Built specifically around ${audience.split(',')[0]?.trim() || 'this use case'}`,
          benefit: `No generic workflow to bend into shape — it already fits`,
          outcome: `Faster adoption and fewer "this doesn't quite work for us" complaints`,
        },
        {
          feature: `Lightweight setup, no migration project`,
          benefit: `Teams can try it without a procurement cycle`,
          outcome: `Shorter sales cycles and faster time to first value`,
        },
      ],
    },

    competition: {
      competitors: competitorNames.slice(0, 3).map((c, i) => {
        const audiencePrimary = audience.split(',')[0]?.trim() || 'this audience';
        const strengths = [
          `Established, trusted, broad feature set`,
          `Cheap, familiar, already in most workflows`,
          `Deep integrations and a large existing user base`,
        ];
        const weaknesses = [
          `Not built specifically for ${midClause(problem)} — ${audiencePrimary} has to bend it into shape`,
          `General-purpose by design, so it takes real setup work before it fits ${audiencePrimary}'s actual workflow`,
          `Priced and packaged for larger teams, with a learning curve ${audiencePrimary} didn't sign up for`,
        ];
        const opportunities = [
          `Win on being purpose-built: less setup, faster time-to-value, and messaging that speaks directly to this problem instead of around it`,
          `Win on simplicity — ${audiencePrimary} can be live in minutes instead of running a rollout project`,
          `Win on focus: do the one job ${audiencePrimary} cares about extremely well, instead of competing on total feature count`,
        ];
        return {
          name: c,
          strength: strengths[i % strengths.length],
          weakness: weaknesses[i % weaknesses.length],
          opportunity: opportunities[i % opportunities.length],
        };
      }),
      takeaway: `Don't compete with ${primaryCompetitor} on feature count — compete on fit. ${name} should own the specific job ${audience.split(',')[0]?.trim() || 'this audience'} is hiring a tool to do, not try to be a smaller version of an established platform.`,
      swot: {
        strengths: [`Sharp, differentiated wedge (${midClause(diffLine)})`, `Fast to try, fast to get value from`],
        weaknesses: [`Smaller team and brand recognition than ${primaryCompetitor}`, `Fewer integrations at this stage`],
        opportunities: [`${audience.split(',')[0]?.trim() || 'Target buyers'} actively frustrated with generic tools right now`, `Word-of-mouth potential within a tight-knit audience`],
        threats: [`${primaryCompetitor} could ship a competing feature aimed at this same wedge`, `Category confusion if messaging drifts toward "another ${category.trim() || 'tool'}"`],
      },
    },

    launch: {
      preLaunch: {
        name: 'Pre-Launch',
        objective: `Validate messaging with ${audience.split(',')[0]?.trim() || 'the target audience'} and build a waitlist of people who've confirmed the problem is real for them`,
        channels: ['Personal network / warm outreach', 'A focused landing page', 'One relevant online community'],
        tactics: [`Talk to 10-15 people who match ${audience.split(',')[0]?.trim() || 'the ICP'} before writing final copy`, `Publish a single sharp landing page built around "${diffLine}"`, `Collect emails, not just page views`],
        kpi: 'Qualified waitlist signups',
      },
      launch: {
        name: 'Launch',
        objective: `Convert warm interest into first paying (or first active) users`,
        channels: goal === 'Enter a New Market' ? ['Targeted outreach in the new market', 'Product Hunt', 'Founder-led social'] : ['Product Hunt', 'Founder-led social (LinkedIn/X)', 'Email to the pre-launch list'],
        tactics: ['Ship the Product Hunt / launch-day assets ahead of time', 'Personally onboard the first cohort of users', 'Ask every early user for one specific piece of feedback'],
        kpi: goal === 'Launch a Product' ? 'Activated users in week one' : 'New signups converted to active use',
      },
      postLaunch: {
        name: 'Post-Launch',
        objective: 'Turn early usage into retained, referring customers',
        channels: ['Email / lifecycle messaging', 'Customer interviews', 'Case studies from the best-fit early users'],
        tactics: ['Interview the users who got value fastest — that’s the sharpest version of the ICP', 'Fix the top onboarding drop-off point', 'Turn one strong early result into a case study or testimonial'],
        kpi: 'Week-4 retention / repeat usage',
      },
      primaryKPI: goal === 'Acquire Customers' ? 'New qualified customers per week' : goal === 'Increase Adoption' ? 'Weekly active users' : 'Activated users (completed the core workflow once)',
      secondaryKPIs: ['Landing page visitor → signup conversion', 'Time to first value', 'Early NPS / qualitative feedback'],
      checklist: [
        'Landing page live and built around the core positioning statement',
        'Analytics in place to track signup → activation',
        'First 10-15 target users interviewed or contacted directly',
        'Launch-day content (post, email, Product Hunt assets) drafted ahead of time',
        'A plan for personally onboarding the first cohort',
      ],
    },

    content: {
      landingPage: `Headline: ${firstSentence(description).replace(/\.$/, '') || name}\n\nSubhead: Built for ${audience.split(',')[0]?.trim() || 'people who need this to just work'} — not retrofitted from a tool meant for everyone.\n\n${name} exists because ${problem.charAt(0).toLowerCase()}${problem.slice(1)} With ${name}, that's handled by default, not something you configure your way into.\n\nCTA: Try ${name} free`,
      launchEmail: `Subject: Introducing ${name}\n\nHi {{first_name}},\n\nWe built ${name} because ${midClause(problem)} — and every tool we tried treated that as an afterthought instead of the main problem.\n\n${name} is ${lowerFirst(description)}\n\nIf that sounds like something you've been dealing with, I'd love for you to try it.\n\nCTA: Get started with ${name} →`,
      linkedin: `Most tools built for ${category.trim() || 'this space'} weren't actually built for ${audience.split(',')[0]?.trim() || 'this specific problem'}.\n\nWe kept running into ${midClause(problem)}, and every existing option — including ${primaryCompetitor} — made us bend our workflow to fit theirs.\n\nSo we built ${name}: ${lowerFirst(description)}\n\nIf this sounds familiar, I'd genuinely love your feedback. Link in comments.`,
      paidSocial: `Stop working around ${primaryCompetitor}.\n\n${name} is built specifically for ${audience.split(',')[0]?.trim() || 'you'} — no setup project, no bending a generic tool into shape.\n\nTry it free →`,
      googleAd: `Headline 1: ${name} — ${category.trim() || 'Built For You'}\nHeadline 2: Purpose-Built, Not Generic\nDescription: ${firstSentence(description).replace(/\.$/, '') || 'Solve it directly'}. Built for ${audience.split(',')[0]?.trim() || 'your team'}. Try it free today.`,
      pressRelease: `FOR IMMEDIATE RELEASE\n\n${name} Launches to Help ${audience.split(',')[0]?.trim() || 'Teams'} Solve ${category.trim() || 'a Long-Standing Problem'}\n\n${name} today announced the launch of its ${category.trim() || 'product'}, built specifically for ${audience.split(',')[0]?.trim() || 'its target market'}. Unlike general-purpose tools such as ${primaryCompetitor}, ${name} is built around one problem: ${problem.charAt(0).toLowerCase()}${problem.slice(1)}\n\n"${lowerFirst(description)}" said a spokesperson for ${name}. "${midClause(diffLine).replace(/^./, (c) => c.toUpperCase())} is what makes this different."\n\n${name} is available today.\n\nAbout ${name}: ${lowerFirst(description)}`,
      productHunt: `Tagline: ${firstSentence(description).replace(/\.$/, '').slice(0, 60) || name}\n\nDescription: ${name} helps ${audience.split(',')[0]?.trim() || 'its users'} stop dealing with ${problem.charAt(0).toLowerCase()}${problem.slice(1)} It's ${lowerFirst(description)}\n\nMaker comment: Hey Product Hunt! We built ${name} after running into ${midClause(problem)} ourselves. Would love your feedback — especially from anyone who fits ${audience.split(',')[0]?.trim() || 'our target audience'}.`,
    },

    sales: {
      onePager: `${name} is ${lowerFirst(description)} Built for ${audience.split(',')[0]?.trim() || 'teams who feel this problem'}, it solves ${midClause(problem)} directly, instead of as an afterthought bolted onto a broader tool like ${primaryCompetitor}. Teams get value in minutes, not after a migration project.`,
      battlecard: `VS. ${primaryCompetitor.toUpperCase()}\n\nTheir strength: established, broad feature set, already familiar to buyers.\nTheir weakness: not built for ${midClause(problem)} specifically — it's a workaround, not a fit.\n\nOur angle: ${midClause(diffLine)}. Lead with the specific job, not the feature comparison.`,
      objections: [
        `"We already use ${primaryCompetitor}"`,
        `"How is this actually different from what we have?"`,
        `"Is this worth switching for?"`,
      ],
      objectionHandling: [
        `Agree that switching tools is real work — then ask what it currently costs them (in time or errors) to work around the gap ${name} closes.`,
        `Point to the one thing ${name} does that ${primaryCompetitor} would need a workaround for: ${midClause(diffLine)}.`,
        `Reframe "switching" as "adding" — most teams run ${name} alongside existing tools for the one job it does best, then expand from there.`,
      ],
      discoveryQuestions: [
        `Walk me through what happens today when ${midClause(problem)}?`,
        `What have you tried so far — ${primaryCompetitor}, spreadsheets, something else?`,
        `If this were solved, what would you expect to change in the next month?`,
      ],
      pitch: `${name} exists because ${midClause(problem)}, and nothing built for a general audience — including ${primaryCompetitor} — treats that as the core problem. We built it specifically for ${audience.split(',')[0]?.trim() || 'this audience'}, so it works the way they already think about the problem, not the way a broader tool assumes everyone does.`,
    },
  };
}
