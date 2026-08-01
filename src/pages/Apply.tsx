import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CheckCircle2, FileText, Upload, X, Sparkles } from "lucide-react";
import { getCycle, addApplication, type NewApplicationInput } from "@/lib/data";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Public candidate application — /apply/:cycleId.
   Unauthenticated, single-column, editorial. Renders the cycle's form_config
   (screening questions) from the data layer, validates on the client, and on
   submit creates a real Application (which also generates match rows across
   every host startup, so the candidate immediately appears in the pools).
   No real upload / no network.
--------------------------------------------------------------------------- */

const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "Master's"];

type Errors = Record<string, string>;

/** Cheap deterministic mock of the authenticity signal (real one lands in Step 7). */
function mockAuthenticity(answers: string[]): { score: number; rationale: string } {
  const joined = answers.join(" ").trim();
  const words = joined ? joined.split(/\s+/).length : 0;
  // Longer, specific answers read as more human; terse/empty reads as more synthetic.
  const raw = words < 20 ? 62 : words < 60 ? 34 : 14;
  const jitter = (joined.length * 7) % 11; // stable per-content wobble
  const score = Math.max(6, Math.min(88, raw + jitter - 5));
  const rationale =
    score <= 30
      ? "Specific, first-person detail across answers — reads as human-written."
      : score <= 65
        ? "Mixed signals: some concrete detail, some generic phrasing."
        : "Short, generic phrasing with little specific detail.";
  return { score, rationale };
}

function Label({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <span className="text-meta font-medium">
      {children}{" "}
      {optional ? (
        <span className="font-normal text-secondary">— optional</span>
      ) : (
        <span className="text-auth-red">*</span>
      )}
    </span>
  );
}

const inputCls =
  "h-11 rounded-lg border border-hairline bg-surface px-3.5 text-body outline-none transition-all placeholder:text-secondary focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]";

export default function Apply() {
  const { cycleId } = useParams();
  const cycle = getCycle();
  const reduce = useReducedMotion();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gpa, setGpa] = useState("");
  const [year, setYear] = useState("");
  const [major, setMajor] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState("");
  const [resume, setResume] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState<null | { name: string }>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const setAnswer = (id: string, v: string) =>
    setAnswers((a) => ({ ...a, [id]: v }));

  const addSkill = (raw: string) => {
    const s = raw.trim().replace(/,$/, "").trim();
    if (s && !skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setSkills((prev) => [...prev, s]);
    }
    setSkillDraft("");
  };

  // Progress across the required fields (drives the top bar).
  const requiredFilled = useMemo(() => {
    const checks = [
      name.trim(),
      email.trim(),
      gpa.trim(),
      year,
      major.trim(),
      skills.length ? "y" : "",
      resume,
      ...cycle.screeningQuestions.map((q) => (answers[q.id] || "").trim()),
    ];
    const done = checks.filter(Boolean).length;
    return { done, total: checks.length };
  }, [name, email, gpa, year, major, skills, resume, answers, cycle.screeningQuestions]);

  const progressPct = Math.round((requiredFilled.done / requiredFilled.total) * 100);

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim()) e.name = "Enter your full name.";
    if (!email.trim()) e.email = "Enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = "That email doesn't look right.";
    const g = parseFloat(gpa);
    if (!gpa.trim()) e.gpa = "Enter your GPA.";
    else if (isNaN(g) || g < 0 || g > 4) e.gpa = "GPA must be between 0 and 4.";
    if (!year) e.year = "Select your year.";
    if (!major.trim()) e.major = "Enter your major.";
    if (!skills.length) e.skills = "Add at least one skill.";
    if (!resume) e.resume = "Attach your resume.";
    for (const q of cycle.screeningQuestions) {
      if (!(answers[q.id] || "").trim()) e[q.id] = "This answer is required.";
    }
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      // Scroll to the first error for a humane failure.
      const first = document.querySelector("[data-invalid='true']");
      first?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      return;
    }

    const orderedAnswers = cycle.screeningQuestions.map((q) => answers[q.id] || "");
    const auth = mockAuthenticity(orderedAnswers);

    const input: NewApplicationInput = {
      name: name.trim(),
      email: email.trim(),
      gpa: parseFloat(gpa),
      year,
      major: major.trim(),
      skills,
      blurb: `${major.trim()} student · ${year}`,
      answers: { ...answers },
      resumeFileName: resume ?? undefined,
      aiAuthenticityScore: auth.score,
      aiAuthenticityRationale: auth.rationale,
    };

    const app = addApplication(input); // also seeds match rows across every startup
    setSubmitted({ name: app.name });
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  /* --------------------------- confirmation --------------------------- */
  if (submitted) {
    return (
      <main className="min-h-screen bg-canvas text-ink">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-6 py-32 text-center">
          <motion.div
            initial={reduce ? false : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="grid h-16 w-16 place-items-center rounded-full bg-auth-green-soft text-auth-green"
          >
            <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />
          </motion.div>
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-h1 font-normal leading-none tracking-tight">
              Application received
            </h1>
            <p className="mx-auto max-w-[46ch] text-body leading-relaxed text-secondary">
              Thanks, {submitted.name.split(" ")[0]}. Your application is now in the shared{" "}
              {cycle.name} pool and visible to every QSTP host startup in this cohort. We'll be in
              touch by email.
            </p>
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2 text-meta text-secondary">
            <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.5} />
            Your written answers were checked for AI authorship.
          </div>
        </div>
      </main>
    );
  }

  /* ------------------------------- form ------------------------------- */
  const invalid = (k: string) => Boolean(errors[k]);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      {/* top bar */}
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-hairline bg-surface px-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="grid h-5 w-5 place-items-center rounded-md border-[1.5px] border-ink">
            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
          </div>
          <span className="font-display text-body">Rubric</span>
          <span className="hidden pl-1.5 text-meta text-secondary sm:inline">
            {cycle.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-meta text-secondary sm:inline">
            {requiredFilled.done}/{requiredFilled.total} complete
          </span>
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-skeleton">
            <motion.div
              className="h-full rounded-full bg-accent"
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            />
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto flex w-full max-w-[680px] flex-col gap-9 px-6 pb-24 pt-11 sm:px-10"
      >
        {/* hero */}
        <header className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-auth-green-soft px-2.5 py-1 text-eyebrow font-medium text-auth-green">
              Accepting applications
            </span>
            <span className="text-meta text-secondary">One application · shared with every host</span>
          </div>
          <h1 className="font-display text-h1 font-normal leading-[1.05] tracking-tight">
            {cycle.name}
          </h1>
          <p className="max-w-[62ch] text-body leading-relaxed text-secondary">
            Apply once to Qatar Science &amp; Technology Park's host startups for this cohort. One
            profile, matched against every open role — you don't pick the company, the fit does.
          </p>
        </header>

        <Divider />

        {/* about you */}
        <Section eyebrow="About you">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldWrap label={<Label>Full name</Label>} error={errors.name} invalid={invalid("name")}>
              <input
                className={inputCls}
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FieldWrap>
            <FieldWrap label={<Label>Email address</Label>} error={errors.email} invalid={invalid("email")}>
              <input
                className={inputCls}
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FieldWrap>
            <FieldWrap label={<Label>GPA</Label>} error={errors.gpa} invalid={invalid("gpa")}>
              <input
                className={inputCls}
                inputMode="decimal"
                placeholder="3.6"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
              />
            </FieldWrap>
            <FieldWrap label={<Label>Academic year</Label>} error={errors.year} invalid={invalid("year")}>
              <select
                className={cn(inputCls, "appearance-none", !year && "text-secondary")}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="" disabled>
                  Select your year
                </option>
                {YEARS.map((y) => (
                  <option key={y} value={y} className="text-ink">
                    {y}
                  </option>
                ))}
              </select>
            </FieldWrap>
          </div>

          <FieldWrap label={<Label>Major / programme</Label>} error={errors.major} invalid={invalid("major")}>
            <input
              className={inputCls}
              placeholder="e.g. BSc Computer Science"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
          </FieldWrap>

          <FieldWrap
            label={<Label>Skills</Label>}
            error={errors.skills}
            invalid={invalid("skills")}
            hint="Type a skill and press Enter. These drive your matches."
          >
            <div
              className={cn(
                "flex min-h-11 flex-wrap items-center gap-2 rounded-lg border border-hairline bg-surface px-2.5 py-2 transition-all focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-soft)]",
                invalid("skills") && "border-auth-red"
              )}
            >
              {skills.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 rounded-full bg-accent-soft py-1 pl-3 pr-2 text-meta font-medium text-accent"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => setSkills((prev) => prev.filter((x) => x !== s))}
                    className="grid h-4 w-4 place-items-center rounded-full transition-colors hover:bg-accent hover:text-white"
                    aria-label={`Remove ${s}`}
                  >
                    <X className="h-3 w-3" strokeWidth={2} />
                  </button>
                </span>
              ))}
              <input
                className="min-w-[8ch] flex-1 bg-transparent px-1.5 py-1 text-body outline-none placeholder:text-secondary"
                placeholder={skills.length ? "Add another…" : "Python, React, SQL…"}
                value={skillDraft}
                onChange={(e) => setSkillDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addSkill(skillDraft);
                  } else if (e.key === "Backspace" && !skillDraft && skills.length) {
                    setSkills((prev) => prev.slice(0, -1));
                  }
                }}
                onBlur={() => skillDraft && addSkill(skillDraft)}
              />
            </div>
          </FieldWrap>
        </Section>

        <Divider />

        {/* resume */}
        <Section eyebrow="Documents" aside="PDF or DOCX · 5 MB max">
          <FieldWrap label={<Label>Resume</Label>} error={errors.resume} invalid={invalid("resume")}>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={cn(
                "flex items-center gap-3.5 rounded-xl border p-4 text-left transition-all",
                resume
                  ? "border-hairline bg-surface"
                  : "border-dashed border-hairline hover:border-accent",
                invalid("resume") && "border-auth-red"
              )}
            >
              <div
                className={cn(
                  "grid h-10 w-10 flex-none place-items-center rounded-lg",
                  resume ? "bg-auth-green-soft text-auth-green" : "bg-skeleton text-secondary"
                )}
              >
                {resume ? (
                  <FileText className="h-[18px] w-[18px]" strokeWidth={1.5} />
                ) : (
                  <Upload className="h-[18px] w-[18px]" strokeWidth={1.5} />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={cn("text-meta font-medium", !resume && "text-secondary")}>
                  {resume ?? "Attach your resume"}
                </span>
                <span className="text-meta text-secondary">
                  {resume ? "Attached · parsed for skills" : "Click to browse — required to submit"}
                </span>
              </div>
              <span className="flex-none rounded-lg border border-hairline px-3.5 py-1.5 text-meta font-medium">
                {resume ? "Replace" : "Browse"}
              </span>
            </button>
            {/* Mock input — we never read the bytes, just the filename. */}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setResume(f.name);
              }}
            />
          </FieldWrap>
        </Section>

        <Divider />

        {/* screening questions */}
        <Section
          eyebrow="Screening questions"
          aside={`All ${cycle.screeningQuestions.length} required`}
        >
          {cycle.screeningQuestions
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((q, i) => {
              const val = answers[q.id] || "";
              const wordCount = val.trim() ? val.trim().split(/\s+/).length : 0;
              return (
                <div key={q.id} className="flex flex-col gap-2" data-invalid={invalid(q.id)}>
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-meta text-secondary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-body font-medium leading-snug">
                      {q.text} <span className="text-auth-red">*</span>
                    </span>
                  </div>
                  <textarea
                    className={cn(
                      "min-h-24 resize-y rounded-lg border border-hairline bg-surface p-3.5 text-body leading-relaxed outline-none transition-all placeholder:text-secondary focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]",
                      invalid(q.id) && "border-auth-red"
                    )}
                    placeholder="Be specific — concrete detail matters more than polish."
                    value={val}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                  />
                  <div className="flex justify-between text-meta text-secondary">
                    <span>{invalid(q.id) ? <span className="text-auth-red">{errors[q.id]}</span> : "200 words max"}</span>
                    <span>{wordCount} / 200 words</span>
                  </div>
                </div>
              );
            })}
        </Section>

        {/* footer / submit */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-hairline pt-6 sm:flex-row sm:items-center">
          <p className="max-w-[46ch] text-meta leading-relaxed text-secondary">
            Your application is shared with QSTP host startups in this cohort only. Written answers
            are checked for AI authorship.
          </p>
          <div className="flex flex-none items-center gap-3">
            <span className="text-meta text-secondary">
              {requiredFilled.done === requiredFilled.total
                ? "Ready to submit"
                : `${requiredFilled.total - requiredFilled.done} left`}
            </span>
            <button
              type="submit"
              className="h-11 rounded-lg bg-accent px-6 text-body font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Submit application
            </button>
          </div>
        </div>

        <AnimatePresence>
          {Object.keys(errors).length > 0 && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-meta text-auth-red"
            >
              Please fix the highlighted fields above.
            </motion.p>
          )}
        </AnimatePresence>

        {/* invisible anchor uses cycleId so the route param is meaningful */}
        <span className="sr-only">Cycle: {cycleId}</span>
      </form>
    </main>
  );
}

/* ------------------------------ helpers ------------------------------ */

function Divider() {
  return <div className="h-px bg-hairline" />;
}

function Section({
  eyebrow,
  aside,
  children,
}: {
  eyebrow: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <span className="text-eyebrow font-medium uppercase tracking-[0.12em] text-secondary">
          {eyebrow}
        </span>
        {aside && <span className="text-meta text-secondary">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

function FieldWrap({
  label,
  hint,
  error,
  invalid,
  children,
}: {
  label: React.ReactNode;
  hint?: string;
  error?: string;
  invalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5" data-invalid={invalid ? "true" : undefined}>
      {label}
      {children}
      {invalid && error ? (
        <span className="text-meta text-auth-red">{error}</span>
      ) : hint ? (
        <span className="text-meta text-secondary">{hint}</span>
      ) : null}
    </div>
  );
}
