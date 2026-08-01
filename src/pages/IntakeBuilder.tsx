import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Plus,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Copy,
  ExternalLink,
  Menu,
} from "lucide-react";
import type { EmploymentType, ScreeningQuestion } from "@/data/types";
import { getCycle, addStartup, setScreeningQuestions } from "@/lib/data";
import { improveDescription, suggestScreeningQuestions } from "@/lib/ai";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Intake Builder — /intake. A 3-step flow that publishes a new host-startup
   role into the shared cycle: (1) public role details, (2) application form +
   screening-question builder, (3) review + shareable /apply link. Persists via
   the mock-first data layer (addStartup / setScreeningQuestions). Two AI-assist
   actions ("Improve with AI", "Suggest questions") are backed by the mocked
   async helper in src/lib/ai.ts — real loading state + accept/insert, no network.
--------------------------------------------------------------------------- */

type FieldState = "Required" | "Optional" | "Hidden";

const FIELD_DEFS: { label: string; hint: string; init: FieldState }[] = [
  { label: "Full name", hint: "Shown on every ranked row", init: "Required" },
  { label: "Email address", hint: "Used for interview scheduling", init: "Required" },
  { label: "University & programme", hint: "Feeds the fit model", init: "Required" },
  { label: "Expected graduation", hint: "Filters eligibility", init: "Required" },
  { label: "Portfolio or GitHub", hint: "Optional link field", init: "Optional" },
  { label: "Phone number", hint: "Off by default — lowers completion", init: "Hidden" },
];

const STEPS = [
  { title: "Role details", sub: "Public copy" },
  { title: "Application form", sub: "Fields & questions" },
  { title: "Review", sub: "Publish & share link" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

let localQ = 0;
const newQid = () => `q-new-${++localQ}`;

export default function IntakeBuilder() {
  const cycle = getCycle();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [step, setStep] = useState(0);

  // Step A — public details
  const [roleTitle, setRoleTitle] = useState("");
  const [host, setHost] = useState("");
  const [description, setDescription] = useState("");
  const [quals, setQuals] = useState<string[]>(["Python", "Machine Learning", "Computer Vision"]);
  const [qualDraft, setQualDraft] = useState("");
  const [employment, setEmployment] = useState<EmploymentType>("full_time");

  // Step B — form + questions
  const [fields, setFields] = useState<FieldState[]>(FIELD_DEFS.map((f) => f.init));
  const [questions, setQuestions] = useState<ScreeningQuestion[]>(
    cycle.screeningQuestions
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((q) => ({ ...q }))
  );
  const [qDraft, setQDraft] = useState("");

  // AI: improve description
  const [improving, setImproving] = useState(false);
  const [aiDraft, setAiDraft] = useState<string | null>(null);

  // AI: suggest questions
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<{ text: string; added: boolean }[]>([]);

  // Step C — publish result
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const link = useMemo(
    () => `${window.location.origin}/apply/${cycle.publicSlug}`,
    [cycle.publicSlug]
  );
  const prettyLink = `apply.rubric.qstp/${cycle.publicSlug}/${
    (host || "host").toLowerCase().replace(/\s+/g, "-")
  }/${(roleTitle || "role").toLowerCase().replace(/\s+/g, "-")}`;

  const canContinueA = roleTitle.trim().length > 0 && host.trim().length > 0;

  /* ------------------------------ actions ------------------------------ */

  const addQual = () => {
    const v = qualDraft.trim();
    if (!v) return;
    setQuals((q) => [...q, v]);
    setQualDraft("");
  };
  const removeQual = (i: number) => setQuals((q) => q.filter((_, idx) => idx !== i));

  const addQuestion = () => {
    const v = qDraft.trim();
    if (!v) return;
    setQuestions((qs) => [...qs, { id: newQid(), text: v, sortOrder: qs.length + 1 }]);
    setQDraft("");
  };
  const removeQuestion = (id: string) =>
    setQuestions((qs) => qs.filter((q) => q.id !== id));

  async function runImprove() {
    if (improving) return;
    setImproving(true);
    setAiDraft(null);
    try {
      const out = await improveDescription(description, {
        roleTitle: roleTitle,
        host: host,
      });
      setAiDraft(out);
    } finally {
      setImproving(false);
    }
  }
  const acceptImprove = () => {
    if (aiDraft) setDescription(aiDraft);
    setAiDraft(null);
  };

  async function runSuggest() {
    if (suggesting) return;
    setSuggesting(true);
    try {
      const out = await suggestScreeningQuestions({
        roleTitle,
        description,
        qualifications: quals,
      });
      // Drop any that already match an existing question verbatim.
      const existing = new Set(questions.map((q) => q.text.trim().toLowerCase()));
      setSuggestions(
        out
          .filter((t) => !existing.has(t.trim().toLowerCase()))
          .map((text) => ({ text, added: false }))
      );
    } finally {
      setSuggesting(false);
    }
  }
  const addSuggestion = (i: number) => {
    setSuggestions((s) => s.map((x, idx) => (idx === i ? { ...x, added: true } : x)));
    setQuestions((qs) => [
      ...qs,
      { id: newQid(), text: suggestions[i].text, sortOrder: qs.length + 1 },
    ]);
  };

  function publish() {
    const startup = addStartup({
      name: host.trim(),
      roleTitle: roleTitle.trim(),
      needsDescription: description.trim() || `Join ${host.trim()} as a ${roleTitle.trim()}.`,
      employmentType: employment,
      capacity: 2,
      skillsWanted: quals.map((q) => q.trim()).filter(Boolean),
    });
    setScreeningQuestions(
      questions.map((q, i) => ({ id: q.id, text: q.text, sortOrder: i + 1 }))
    );
    setPublishedId(startup.id);
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked in sandbox — ignore */
    }
  };

  /* ------------------------------ nav ------------------------------ */

  const goNext = () => {
    if (step === 0) {
      if (!canContinueA) return;
      setStep(1);
    } else if (step === 1) {
      publish(); // persist on entering review; step C shows the live link
      setStep(2);
    } else {
      if (publishedId) navigate(`/match/${publishedId}`);
    }
  };
  const goBack = () => {
    if (step === 0) navigate("/dashboard");
    else setStep((s) => s - 1);
  };

  const nextLabel =
    step === 0 ? "Continue to form" : step === 1 ? "Publish & review" : "Open match pool";
  const footNote =
    step === 0
      ? "Nothing is public until you publish"
      : step === 1
      ? "Adding a question makes it mandatory for every applicant"
      : "Live in the shared QSTP pool";
  const backLabel = step === 0 ? "Cancel" : "Back";

  // Keyed remount per step (no AnimatePresence): the incoming content fades
  // in on mount; React unmounts the old step instantly. Avoids the mode="wait"
  // deadlock that a nested height:auto exit animation can cause.
  const stepMotion = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.32, ease: EASE },
      };

  return (
    <div className="flex h-full flex-col">
      {/* crumb bar */}
      <div className="flex flex-none items-center justify-between border-b border-hairline px-8 py-4">
        <div className="flex items-center gap-2.5 text-meta text-secondary">
          <span>New role</span>
          <span className="opacity-50">/</span>
          <span className="font-medium text-ink">{roleTitle.trim() || "Untitled role"}</span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="h-8 rounded-lg border border-hairline px-3.5 text-meta font-medium text-secondary transition-colors hover:border-accent hover:text-ink"
        >
          Save &amp; exit
        </button>
      </div>

      {/* step indicator */}
      <div className="flex flex-none items-center gap-0 border-b border-hairline px-8 py-4">
        {STEPS.map((s, i) => {
          const done = i < step;
          const cur = i === step;
          return (
            <div key={s.title} className="flex items-center gap-3 pr-7">
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i >= step}
                className={cn(
                  "grid h-[26px] w-[26px] place-items-center rounded-full border text-eyebrow font-medium transition-colors",
                  cur && "border-accent bg-accent text-white",
                  done && "border-auth-green bg-auth-green-soft text-auth-green",
                  !cur && !done && "border-hairline text-secondary"
                )}
              >
                {done ? <Check className="h-3 w-3" strokeWidth={2.5} /> : i + 1}
              </button>
              <div className="flex flex-col gap-0.5">
                <span className={cn("text-meta font-medium", cur ? "text-ink" : "text-secondary")}>
                  {s.title}
                </span>
                <span className="text-eyebrow text-secondary">{s.sub}</span>
              </div>
              {i < STEPS.length - 1 && <div className="ml-4 h-px w-10 bg-hairline" />}
            </div>
          );
        })}
        <span className="ml-auto text-eyebrow font-medium uppercase tracking-[0.08em] text-secondary">
          Step {step + 1} of 3
        </span>
      </div>

      {/* body */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[880px] px-8 py-9">
          <motion.div key={step} {...stepMotion}>
            {step === 0 && (
                <StepA
                  roleTitle={roleTitle}
                  setRoleTitle={setRoleTitle}
                  host={host}
                  setHost={setHost}
                  description={description}
                  setDescription={setDescription}
                  quals={quals}
                  qualDraft={qualDraft}
                  setQualDraft={setQualDraft}
                  addQual={addQual}
                  removeQual={removeQual}
                  employment={employment}
                  setEmployment={setEmployment}
                  improving={improving}
                  aiDraft={aiDraft}
                  runImprove={runImprove}
                  acceptImprove={acceptImprove}
                  discardImprove={() => setAiDraft(null)}
                  reduce={!!reduce}
                />
              )}
              {step === 1 && (
                <StepB
                  fields={fields}
                  setFields={setFields}
                  questions={questions}
                  qDraft={qDraft}
                  setQDraft={setQDraft}
                  addQuestion={addQuestion}
                  removeQuestion={removeQuestion}
                  suggesting={suggesting}
                  suggestions={suggestions}
                  runSuggest={runSuggest}
                  addSuggestion={addSuggestion}
                />
              )}
              {step === 2 && (
                <StepC
                  roleTitle={roleTitle}
                  host={host}
                  employment={employment}
                  quals={quals}
                  fields={fields}
                  questions={questions}
                  prettyLink={prettyLink}
                  link={link}
                  copied={copied}
                  copyLink={copyLink}
                  onEdit={(s) => setStep(s)}
                />
              )}
          </motion.div>
        </div>
      </div>

      {/* footer nav */}
      <div className="flex flex-none items-center justify-between border-t border-hairline px-8 py-4">
        <button
          onClick={goBack}
          className="flex h-10 items-center gap-2 rounded-lg border border-hairline px-4 text-meta font-medium text-secondary transition-colors hover:border-accent hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
          {backLabel}
        </button>
        <div className="flex items-center gap-4">
          <span className="hidden text-meta text-secondary sm:block">{footNote}</span>
          <button
            onClick={goNext}
            disabled={step === 0 && !canContinueA}
            className={cn(
              "flex h-10 items-center gap-2 rounded-lg bg-accent px-5 text-meta font-medium text-white transition-colors hover:bg-accent-hover",
              step === 0 && !canContinueA && "cursor-not-allowed opacity-40"
            )}
          >
            {nextLabel}
            <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================
   Step A — Public role details
======================================================================== */

const inputCls =
  "h-10 rounded-lg border border-hairline bg-surface px-3 text-meta text-ink outline-none transition-colors placeholder:text-secondary focus:border-accent";

function StepHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-display text-h2 font-normal leading-tight tracking-tight">{title}</h1>
      <p className="max-w-[62ch] text-meta leading-relaxed text-secondary">{sub}</p>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-meta font-medium">{children}</span>;
}

function StepA(props: {
  roleTitle: string;
  setRoleTitle: (v: string) => void;
  host: string;
  setHost: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  quals: string[];
  qualDraft: string;
  setQualDraft: (v: string) => void;
  addQual: () => void;
  removeQual: (i: number) => void;
  employment: EmploymentType;
  setEmployment: (v: EmploymentType) => void;
  improving: boolean;
  aiDraft: string | null;
  runImprove: () => void;
  acceptImprove: () => void;
  discardImprove: () => void;
  reduce: boolean;
}) {
  const {
    roleTitle,
    setRoleTitle,
    host,
    setHost,
    description,
    setDescription,
    quals,
    qualDraft,
    setQualDraft,
    addQual,
    removeQual,
    employment,
    setEmployment,
    improving,
    aiDraft,
    runImprove,
    acceptImprove,
    discardImprove,
    reduce,
  } = props;

  return (
    <div className="flex flex-col gap-8">
      <StepHeader
        title="Public role details"
        sub="Everything on this step appears on the public application page. Interns see it exactly as written."
      />

      <div className="grid gap-5 sm:grid-cols-[1fr_260px]">
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Role title</FieldLabel>
          <input
            className={inputCls}
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="e.g. Machine Learning Intern"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Host startup</FieldLabel>
          <input
            className={inputCls}
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="e.g. Sadeem Robotics"
          />
        </label>
      </div>

      {/* description + improve */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <FieldLabel>Description</FieldLabel>
          <button
            onClick={runImprove}
            disabled={improving}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-full border border-accent px-3 text-eyebrow font-medium text-accent transition-colors hover:bg-accent-soft",
              improving && "cursor-wait opacity-70"
            )}
          >
            {improving ? (
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />
            ) : (
              <Sparkles className="h-3 w-3" strokeWidth={1.8} />
            )}
            {improving ? "Improving…" : "Improve with AI"}
          </button>
        </div>
        <textarea
          className="min-h-[150px] resize-y rounded-lg border border-hairline bg-surface p-4 text-meta leading-relaxed text-ink outline-none transition-colors placeholder:text-secondary focus:border-accent"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the work, the team, and what the intern will own end to end. Keep it real — the AI action only tightens structure, it never invents benefits or requirements."
        />
        <div className="flex items-center justify-between text-eyebrow text-secondary">
          <span>Markdown supported</span>
          <span className="tabular-nums">{description.length} / 4000</span>
        </div>

        {/* AI proposal — accept / discard */}
        <AnimatePresence>
          {aiDraft && (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0, y: -6 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto", y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="mt-1 flex flex-col gap-3 rounded-lg border border-accent bg-accent-soft p-4">
                <div className="flex items-center gap-1.5 text-eyebrow font-medium uppercase tracking-[0.1em] text-accent">
                  <Sparkles className="h-3 w-3" strokeWidth={1.8} />
                  Suggested rewrite
                </div>
                <p className="whitespace-pre-wrap text-meta leading-relaxed text-ink">{aiDraft}</p>
                <div className="flex gap-2.5">
                  <button
                    onClick={acceptImprove}
                    className="flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-meta font-medium text-white transition-colors hover:bg-accent-hover"
                  >
                    <Check className="h-4 w-4" strokeWidth={2} />
                    Replace description
                  </button>
                  <button
                    onClick={discardImprove}
                    className="h-9 rounded-lg border border-hairline px-4 text-meta font-medium text-secondary transition-colors hover:border-accent hover:text-ink"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* required qualifications */}
      <div className="flex flex-col gap-2.5">
        <FieldLabel>Required qualifications &amp; skills</FieldLabel>
        <p className="-mt-1 text-eyebrow text-secondary">
          Also used as the role's match signals against the shared pool.
        </p>
        <div className="flex flex-col gap-2">
          {quals.map((q, i) => (
            <div
              key={`${q}-${i}`}
              className="flex h-10 items-center gap-3 rounded-lg border border-hairline bg-surface px-3"
            >
              <Menu className="h-3.5 w-3.5 flex-none text-secondary" strokeWidth={1.8} />
              <span className="flex-1 text-meta">{q}</span>
              <button
                onClick={() => removeQual(i)}
                className="grid h-6 w-6 place-items-center rounded-md text-secondary transition-colors hover:text-auth-red"
                aria-label={`Remove ${q}`}
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.8} />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              className={cn(inputCls, "flex-1 border-dashed")}
              value={qualDraft}
              onChange={(e) => setQualDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addQual();
                }
              }}
              placeholder="Add a qualification or skill…"
            />
            <button
              onClick={addQual}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-dashed border-hairline px-3.5 text-meta font-medium text-secondary transition-colors hover:border-accent hover:text-accent"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* employment type */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <FieldLabel>Employment type</FieldLabel>
          <div className="flex gap-1 rounded-lg bg-skeleton p-1">
            {(
              [
                ["full_time", "Full-time"],
                ["part_time", "Part-time"],
              ] as const
            ).map(([val, label]) => {
              const active = employment === val;
              return (
                <button
                  key={val}
                  onClick={() => setEmployment(val)}
                  className={cn(
                    "relative flex-1 rounded-md py-1.5 text-meta font-medium transition-colors",
                    active ? "text-ink" : "text-secondary hover:text-ink"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="emp-active"
                      className="absolute inset-0 rounded-md border border-hairline bg-surface"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <FieldLabel>Duration &amp; location</FieldLabel>
          <div className="flex gap-2.5">
            <div className="flex h-10 flex-1 items-center rounded-lg border border-hairline bg-surface px-3 text-meta text-secondary">
              10 weeks
            </div>
            <div className="flex h-10 flex-1 items-center rounded-lg border border-hairline bg-surface px-3 text-meta text-secondary">
              On-site · Doha
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================
   Step B — Application form + screening-question builder
======================================================================== */

const FIELD_CYCLE: Record<FieldState, FieldState> = {
  Required: "Optional",
  Optional: "Hidden",
  Hidden: "Required",
};

function StepB(props: {
  fields: FieldState[];
  setFields: (updater: (f: FieldState[]) => FieldState[]) => void;
  questions: ScreeningQuestion[];
  qDraft: string;
  setQDraft: (v: string) => void;
  addQuestion: () => void;
  removeQuestion: (id: string) => void;
  suggesting: boolean;
  suggestions: { text: string; added: boolean }[];
  runSuggest: () => void;
  addSuggestion: (i: number) => void;
}) {
  const {
    fields,
    setFields,
    questions,
    qDraft,
    setQDraft,
    addQuestion,
    removeQuestion,
    suggesting,
    suggestions,
    runSuggest,
    addSuggestion,
  } = props;

  const cycleField = (i: number) =>
    setFields((f) => f.map((s, idx) => (idx === i ? FIELD_CYCLE[s] : s)));

  const tagCls = (s: FieldState) =>
    s === "Required"
      ? "bg-accent-soft text-accent"
      : s === "Optional"
      ? "bg-skeleton text-secondary"
      : "bg-skeleton text-secondary";

  return (
    <div className="flex flex-col gap-7">
      <StepHeader
        title="Application form"
        sub="Choose what every applicant must give you. Fewer fields raise completion; screening questions raise match precision."
      />

      {/* applicant fields */}
      <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
        <div className="border-b border-hairline px-5 py-3.5 text-eyebrow font-medium uppercase tracking-[0.1em] text-secondary">
          Applicant fields
        </div>
        {FIELD_DEFS.map((f, i) => {
          const state = fields[i];
          const on = state !== "Hidden";
          return (
            <div
              key={f.label}
              className="flex items-center gap-4 border-b border-hairline px-5 py-3"
            >
              <button
                onClick={() => cycleField(i)}
                className={cn(
                  "relative h-6 w-10 flex-none rounded-full border transition-colors",
                  on ? "border-accent bg-accent" : "border-hairline bg-skeleton"
                )}
                aria-label={`Toggle ${f.label}`}
              >
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  className={cn(
                    "absolute top-[2px] h-[18px] w-[18px] rounded-full",
                    on ? "left-[19px] bg-white" : "left-[2px] bg-secondary"
                  )}
                />
              </button>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className={cn("text-meta font-medium", !on && "text-secondary")}>
                  {f.label}
                </span>
                <span className="text-eyebrow text-secondary">{f.hint}</span>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-eyebrow font-medium",
                  tagCls(state)
                )}
              >
                {state}
              </span>
            </div>
          );
        })}
        <div className="flex gap-4 p-4">
          <div className="flex flex-1 flex-col gap-1.5 rounded-lg border border-accent bg-accent-soft p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-meta font-medium">Resume</span>
              <span className="rounded-full bg-accent px-2 py-0.5 text-eyebrow font-medium text-white">
                Required
              </span>
            </div>
            <span className="text-eyebrow leading-relaxed text-secondary">
              PDF or DOCX · max 5 MB. Parsed for the match pool.
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-1.5 rounded-lg border border-hairline p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-meta font-medium">Cover letter</span>
              <span className="rounded-full bg-skeleton px-2 py-0.5 text-eyebrow font-medium text-secondary">
                Optional
              </span>
            </div>
            <span className="text-eyebrow leading-relaxed text-secondary">
              Scored for authenticity when supplied.
            </span>
          </div>
        </div>
      </div>

      {/* questions + AI suggestions */}
      <div className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
        {/* builder */}
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
          <div className="flex items-center justify-between border-b border-hairline px-5 py-3.5">
            <span className="text-eyebrow font-medium uppercase tracking-[0.1em] text-secondary">
              Screening questions
            </span>
            <span className="text-eyebrow text-secondary">Mandatory once added</span>
          </div>
          <AnimatePresence initial={false}>
            {questions.map((q, i) => (
              <motion.div
                key={q.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-3.5 border-b border-hairline px-5 py-3.5"
              >
                <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-full bg-skeleton text-eyebrow font-medium text-secondary">
                  {i + 1}
                </span>
                <p className="flex-1 text-meta leading-snug">{q.text}</p>
                <button
                  onClick={() => removeQuestion(q.id)}
                  className="grid h-6 w-6 flex-none place-items-center rounded-md text-secondary transition-colors hover:text-auth-red"
                  aria-label="Remove question"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="flex items-center gap-2 p-3.5">
            <input
              className={cn(inputCls, "h-9 flex-1 border-dashed")}
              value={qDraft}
              onChange={(e) => setQDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addQuestion();
                }
              }}
              placeholder="Write a question…"
            />
            <button
              onClick={addQuestion}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-hairline px-3 text-meta font-medium text-secondary transition-colors hover:border-accent hover:text-accent"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
              Add
            </button>
          </div>
        </div>

        {/* AI suggestions panel */}
        <div className="overflow-hidden rounded-xl border border-accent bg-surface shadow-ambient">
          <div className="flex items-center gap-2 border-b border-hairline px-4 py-3.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.8} />
            <span className="text-meta font-medium">AI-suggested questions</span>
          </div>
          <div className="flex flex-col gap-3 p-4">
            <p className="text-eyebrow leading-relaxed text-secondary">
              Derived from your description and required qualifications.
            </p>

            {suggestions.length === 0 && !suggesting && (
              <button
                onClick={runSuggest}
                className="flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-meta font-medium text-white transition-colors hover:bg-accent-hover"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
                Suggest questions
              </button>
            )}

            {suggesting && (
              <div className="flex flex-col gap-2.5">
                {[0, 1, 2].map((n) => (
                  <div key={n} className="flex flex-col gap-2 rounded-lg border border-hairline p-3">
                    <div className="h-2.5 w-full rounded-full bg-skeleton" />
                    <div className="h-2.5 w-4/5 rounded-full bg-skeleton opacity-70" />
                  </div>
                ))}
                <span className="flex items-center gap-1.5 text-eyebrow text-secondary">
                  <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />
                  Reading the role…
                </span>
              </div>
            )}

            <AnimatePresence initial={false}>
              {suggestions.map((s, i) => (
                <motion.div
                  key={s.text}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className={cn(
                    "flex flex-col gap-2.5 rounded-lg border p-3",
                    s.added ? "border-accent bg-accent-soft" : "border-hairline"
                  )}
                >
                  <p className="text-meta leading-snug">{s.text}</p>
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => !s.added && addSuggestion(i)}
                      disabled={s.added}
                      className={cn(
                        "flex h-6 items-center gap-1.5 rounded-full px-2.5 text-eyebrow font-medium transition-colors",
                        s.added
                          ? "cursor-default bg-accent text-white"
                          : "bg-accent-soft text-accent hover:bg-accent hover:text-white"
                      )}
                    >
                      {s.added ? (
                        <>
                          <Check className="h-3 w-3" strokeWidth={2.5} /> Added
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3" strokeWidth={2} /> Add
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {suggestions.length > 0 && !suggesting && (
              <button
                onClick={runSuggest}
                className="text-eyebrow font-medium text-accent transition-opacity hover:opacity-70"
              >
                Regenerate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================
   Step C — Review & publish
======================================================================== */

function StepC(props: {
  roleTitle: string;
  host: string;
  employment: EmploymentType;
  quals: string[];
  fields: FieldState[];
  questions: ScreeningQuestion[];
  prettyLink: string;
  link: string;
  copied: boolean;
  copyLink: () => void;
  onEdit: (step: number) => void;
}) {
  const {
    roleTitle,
    host,
    employment,
    quals,
    fields,
    questions,
    prettyLink,
    link,
    copied,
    copyLink,
    onEdit,
  } = props;

  const enabled = fields.filter((f) => f !== "Hidden").length;
  const required = fields.filter((f) => f === "Required").length;
  const empLabel = employment === "full_time" ? "Full-time internship" : "Part-time internship";

  return (
    <div className="flex flex-col gap-6">
      <StepHeader
        title="Review & publish"
        sub="Published roles enter the shared QSTP pool immediately. Applicants can apply from the public link below."
      />

      {/* success card */}
      <div className="flex flex-col gap-3.5 rounded-xl border border-auth-green bg-auth-green-soft p-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-auth-green">
            <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-body font-medium">Published · public application link is live</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="h-10 min-w-0 flex-1 truncate rounded-lg border border-hairline bg-surface px-3.5 font-mono text-meta leading-[38px] text-ink">
            {prettyLink}
          </div>
          <button
            onClick={copyLink}
            className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-meta font-medium text-white transition-colors hover:bg-accent-hover"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" strokeWidth={2} /> Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" strokeWidth={1.8} /> Copy link
              </>
            )}
          </button>
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="flex h-10 items-center gap-2 rounded-lg border border-hairline bg-surface px-4 text-meta font-medium text-secondary transition-colors hover:border-accent hover:text-ink"
          >
            <ExternalLink className="h-4 w-4" strokeWidth={1.8} /> Preview
          </a>
        </div>
        <p className="text-eyebrow text-secondary">
          Added to the shared QSTP pool and to the {host || "host"} match pool.
        </p>
      </div>

      {/* summary cards */}
      <div className="grid gap-5 sm:grid-cols-2">
        <SummaryCard title="Public details" onEdit={() => onEdit(0)}>
          <Row label="Title" value={`${roleTitle} · ${host}`} />
          <Row label="Type" value={`${empLabel} · 10 weeks · On-site, Doha`} />
          <Row
            label="Required qualifications"
            value={quals.join(" · ") || "—"}
          />
        </SummaryCard>
        <SummaryCard title="Form" onEdit={() => onEdit(1)}>
          <SplitRow
            label="Applicant fields"
            value={`${enabled} enabled · ${required} required`}
          />
          <SplitRow label="Resume" value="Required" valueClass="text-auth-green font-medium" />
          <SplitRow label="Cover letter" value="Optional · scored" />
          <SplitRow
            label="Screening questions"
            value={`${questions.length} · all mandatory`}
          />
          <div className="h-px bg-hairline" />
          <p className="text-eyebrow leading-relaxed text-secondary">
            Estimated completion time 6–8 minutes.
          </p>
        </SummaryCard>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
      <div className="flex items-center justify-between border-b border-hairline px-5 py-3.5">
        <span className="text-eyebrow font-medium uppercase tracking-[0.1em] text-secondary">
          {title}
        </span>
        <button
          onClick={onEdit}
          className="text-eyebrow font-medium text-accent transition-opacity hover:opacity-70"
        >
          Edit
        </button>
      </div>
      <div className="flex flex-col gap-3.5 p-5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-eyebrow text-secondary">{label}</span>
      <span className="text-meta font-medium leading-snug">{value}</span>
    </div>
  );
}

function SplitRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between text-meta">
      <span>{label}</span>
      <span className={cn("text-secondary", valueClass)}>{value}</span>
    </div>
  );
}
