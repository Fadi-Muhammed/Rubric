/* ============================================================
   Mocked AI assist layer.
   These return convincing canned output after a short, realistic
   delay so the Intake Builder's "Improve with AI" and "Suggest
   questions" actions feel live. NO network / NO API keys — the real
   Claude calls swap in here at Step 10 without touching the UI.
   ============================================================ */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Simulated model latency (kept short so the demo stays snappy). */
const LATENCY = 1200;

export interface ImproveContext {
  roleTitle?: string;
  host?: string;
}

/**
 * "Rewrite" a role description: tightens structure and voice without
 * inventing new requirements. Mock — deterministic, no network.
 */
export async function improveDescription(
  current: string,
  ctx: ImproveContext = {}
): Promise<string> {
  await wait(LATENCY);

  const role = ctx.roleTitle?.trim() || "this role";
  const host = ctx.host?.trim() || "the team";
  const seed = current.trim();

  // If the recruiter wrote nothing, produce a strong starting draft.
  if (!seed) {
    return [
      `You'll join ${host} as a ${role}, owning one problem end to end rather than shadowing.`,
      `In the first weeks you'll get oriented on our stack and ship a small, real improvement. By mid-programme you'll own a focused project with a clear success metric, working alongside engineers who review your work like a teammate's.`,
      `We care more about how you think than which frameworks you've memorised — bring curiosity, a bias for shipping, and the habit of measuring what you build.`,
    ].join("\n\n");
  }

  // Otherwise, "tighten" the existing copy: dedupe whitespace, lead with
  // the role, and append a crisp closing line in the recruiter's voice.
  const compact = seed.replace(/\s+/g, " ").trim();
  const lead =
    compact.length > 0 && !/^you/i.test(compact)
      ? `As a ${role} at ${host}, ${compact.charAt(0).toLowerCase()}${compact.slice(1)}`
      : compact;

  return [
    lead,
    `You'll own one project end to end — from problem framing to a result we can measure — with real ownership and close review from the team.`,
    `We're looking for how you think and ship, not a checklist of frameworks.`,
  ].join("\n\n");
}

export interface SuggestContext {
  roleTitle?: string;
  description?: string;
  qualifications?: string[];
}

/**
 * Suggest screening questions derived from the role. Mock — returns a
 * blend of role-tailored and evergreen prompts that signal judgement,
 * depth, and authenticity.
 */
export async function suggestScreeningQuestions(
  ctx: SuggestContext = {}
): Promise<string[]> {
  await wait(LATENCY);

  const role = ctx.roleTitle?.trim();
  const firstQual = ctx.qualifications?.[0]?.trim();

  const tailored: string[] = [];
  if (role) {
    tailored.push(
      `Walk us through a ${role.replace(/ intern$/i, "").toLowerCase()} project you owned end to end. What did you change after your first result?`
    );
  }
  if (firstQual) {
    tailored.push(
      `Where does your experience with ${firstQual} go beyond coursework? Point to something concrete you built.`
    );
  }

  const evergreen = [
    "Tell us about a time your evaluation or metric disagreed with real-world performance. What did you do?",
    "Describe a decision you made under uncertainty. What information did you wish you'd had?",
    "What's something you learned recently that changed how you approach your work?",
  ];

  // Fill up to 4 suggestions, tailored first, no duplicates.
  return [...tailored, ...evergreen].slice(0, 4);
}
