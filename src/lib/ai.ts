/* ============================================================
   AI assist layer.
   "Improve with AI" and "Suggest questions" for the Intake Builder.

   When VITE_AI_ENDPOINT points at the deployed Supabase Edge Function
   (supabase/functions/ai), these call OpenRouter server-side — the API
   key never touches the browser. With no endpoint configured they fall
   back to the deterministic mock below, so the demo always works offline.
   ============================================================ */

import { AI_ENDPOINT } from "./supabase";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** POST a task to the AI Edge Function. Throws on any non-OK response. */
async function callAi<T>(payload: Record<string, unknown>): Promise<T> {
  const res = await fetch(AI_ENDPOINT as string, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`AI endpoint ${res.status}`);
  return (await res.json()) as T;
}

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
  // Real path: OpenRouter via the Edge Function. Fall back to the mock on
  // any failure so the demo never dead-ends.
  if (AI_ENDPOINT) {
    try {
      const { text } = await callAi<{ text: string }>({
        task: "improve",
        current,
        roleTitle: ctx.roleTitle,
        host: ctx.host,
      });
      if (text?.trim()) return text.trim();
    } catch {
      /* fall through to mock */
    }
  }

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
  if (AI_ENDPOINT) {
    try {
      const { questions } = await callAi<{ questions: string[] }>({
        task: "suggest",
        roleTitle: ctx.roleTitle,
        description: ctx.description,
        qualifications: ctx.qualifications,
      });
      if (questions?.length) return questions.slice(0, 4);
    } catch {
      /* fall through to mock */
    }
  }

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
