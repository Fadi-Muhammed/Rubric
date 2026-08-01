// Rubric AI assist — Supabase Edge Function (Deno).
//
// Proxies OpenRouter so the API key stays server-side. The browser calls this
// function; the OPENROUTER_API_KEY secret is set on the function, never shipped
// in the bundle.
//
// Deploy:
//   supabase functions deploy ai --no-verify-jwt
//   supabase secrets set OPENROUTER_API_KEY=sk-or-...
//   # optional: override the default model
//   supabase secrets set OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
//
// Request body:  { task: "improve" | "suggest", ...context }
// Response:      { text: string }  or  { questions: string[] }

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = Deno.env.get("OPENROUTER_MODEL") ?? "anthropic/claude-3.5-sonnet";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

interface Body {
  task: "improve" | "suggest";
  current?: string;
  roleTitle?: string;
  host?: string;
  description?: string;
  qualifications?: string[];
}

/** Build the model prompt for each supported task. */
function buildPrompt(b: Body): { system: string; user: string } {
  const role = b.roleTitle?.trim() || "this role";
  const host = b.host?.trim() || "the team";

  if (b.task === "improve") {
    return {
      system:
        "You are a recruiting copy editor. Tighten role descriptions without " +
        "inventing new requirements. Keep the recruiter's meaning. Warm, direct, " +
        "no corporate cliché. Return only the rewritten description as plain prose " +
        "(2–3 short paragraphs), no preamble.",
      user:
        `Role: ${role}\nHost: ${host}\n\n` +
        `Current description:\n${(b.current ?? "").trim() || "(empty — write a strong first draft)"}`,
    };
  }

  return {
    system:
      "You are a recruiting screening designer. Propose sharp screening " +
      "questions that reveal judgement, depth, and authenticity — not trivia. " +
      "Keep each question to one focused sentence of roughly 15–25 words: " +
      "concise and direct, but not terse or generic. " +
      "Return ONLY a JSON array of 4 question strings, nothing else.",
    user:
      `Role: ${role}\n` +
      `Description: ${(b.description ?? "").trim() || "(none)"}\n` +
      `Key qualifications: ${(b.qualifications ?? []).join(", ") || "(none)"}`,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const key = Deno.env.get("OPENROUTER_API_KEY");
  if (!key) return json({ error: "OPENROUTER_API_KEY not configured" }, 500);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }
  if (body.task !== "improve" && body.task !== "suggest") {
    return json({ error: "task must be 'improve' or 'suggest'" }, 400);
  }

  const { system, user } = buildPrompt(body);

  const resp = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "X-Title": "Rubric",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text();
    return json({ error: "openrouter_error", status: resp.status, detail }, 502);
  }

  const data = await resp.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";

  if (body.task === "improve") {
    return json({ text: content.trim() });
  }

  // suggest: parse a JSON array; fall back to line-splitting if the model
  // wrapped it in prose.
  let questions: string[] = [];
  try {
    const match = content.match(/\[[\s\S]*\]/);
    questions = JSON.parse(match ? match[0] : content);
  } catch {
    questions = content
      .split("\n")
      .map((l) => l.replace(/^\s*(?:[-*\d.]+)\s*/, "").trim())
      .filter(Boolean);
  }
  return json({ questions: questions.slice(0, 4) });
});
