import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* ============================================================
   Supabase client + feature flags.

   Rubric is mock-first: the in-memory seed layer (src/lib/data.ts) is
   the default so the app always runs with zero config. Supabase and the
   AI Edge Function switch on only when their env vars are present.

   Env (all optional; put them in .env — never commit it):
     VITE_SUPABASE_URL         project URL
     VITE_SUPABASE_ANON_KEY    anon/public key (safe for the browser)
     VITE_USE_MOCK             "false" to force the Supabase data layer
     VITE_AI_ENDPOINT          Edge Function URL for AI assists (OpenRouter)
   ============================================================ */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when a real Supabase project is configured. */
export const hasSupabase = Boolean(url && anonKey);

/**
 * Use the in-memory seed layer unless VITE_USE_MOCK is explicitly "false"
 * AND a Supabase project is configured. This keeps the demo safe by default:
 * a missing/typo'd env var falls back to mock rather than a blank screen.
 */
export const USE_MOCK =
  import.meta.env.VITE_USE_MOCK === "false" && hasSupabase ? false : true;

/**
 * Edge Function endpoint for AI assists. Prefer the env var, but fall back to
 * the deployed function URL so production (e.g. Vercel without env vars set)
 * still reaches the model. This is only a public, unauthenticated URL — no key
 * is exposed here; the OpenRouter secret stays server-side in the function.
 */
export const AI_ENDPOINT =
  (import.meta.env.VITE_AI_ENDPOINT as string | undefined) ||
  "https://ggbrjebcoajynwgkcfif.supabase.co/functions/v1/ai";

/** Lazily-created singleton client. Null when Supabase isn't configured. */
export const supabase: SupabaseClient | null = hasSupabase
  ? createClient(url as string, anonKey as string)
  : null;
