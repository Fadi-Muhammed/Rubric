import type {
  Application,
  Cycle,
  Match,
  ScreeningQuestion,
  Startup,
} from "./types";

/* ============================================================
   Rubric seed data — one convincing cycle for the demo.
   Matches are generated deterministically from skill overlap
   so the ranking is stable, explainable, and instant on stage.
   ============================================================ */

const now = "2026-07-28T09:00:00.000Z";

/* ------------------------------ cycle ------------------------------ */

export const screeningQuestions: ScreeningQuestion[] = [
  { id: "q1", text: "Why do you want to intern with a QSTP host startup?", sortOrder: 1 },
  { id: "q2", text: "Describe a project you shipped end-to-end.", sortOrder: 2 },
  { id: "q3", text: "What do you most want to learn this summer?", sortOrder: 3 },
];

export const cycle: Cycle = {
  id: "cycle-2026-summer",
  name: "Summer 2026 Internship Program",
  status: "live",
  publicSlug: "summer-2026",
  coverLetterEnabled: true,
  screeningQuestions,
  createdAt: now,
};

/* ----------------------------- startups ----------------------------- */

export const startups: Startup[] = [
  {
    id: "st-sadeem",
    cycleId: cycle.id,
    name: "Sadeem Robotics",
    roleTitle: "Machine Learning Intern",
    needsDescription:
      "Build perception models for autonomous inspection drones. Heavy computer-vision and Python work alongside the robotics team.",
    employmentType: "full_time",
    capacity: 2,
    skillsWanted: ["Machine Learning", "Computer Vision", "Python", "Robotics"],
    createdAt: now,
  },
  {
    id: "st-mannarah",
    cycleId: cycle.id,
    name: "Mannarah",
    roleTitle: "Frontend Engineer Intern",
    needsDescription:
      "Ship customer-facing product surfaces in React + TypeScript. Strong eye for UI detail and interaction polish.",
    employmentType: "full_time",
    capacity: 2,
    skillsWanted: ["React", "TypeScript", "UI/UX", "Node.js"],
    createdAt: now,
  },
  {
    id: "st-meddy",
    cycleId: cycle.id,
    name: "Meddy Health",
    roleTitle: "Data Science Intern",
    needsDescription:
      "Turn messy clinic data into insight. SQL, Python and analysis, with room to grow into applied ML.",
    employmentType: "part_time",
    capacity: 1,
    skillsWanted: ["Python", "Data Analysis", "SQL", "Machine Learning"],
    createdAt: now,
  },
  {
    id: "st-qanz",
    cycleId: cycle.id,
    name: "Qanz",
    roleTitle: "Growth Marketing Intern",
    needsDescription:
      "Own experiments across SEO, content and lifecycle. A builder-marketer who can write and read a dashboard.",
    employmentType: "part_time",
    capacity: 2,
    skillsWanted: ["Marketing", "SEO", "Content", "Growth"],
    createdAt: now,
  },
  {
    id: "st-ledger",
    cycleId: cycle.id,
    name: "Doha Ledger",
    roleTitle: "Web3 Engineer Intern",
    needsDescription:
      "Write and test Solidity contracts and the TypeScript dApp around them. Care about correctness and security.",
    employmentType: "full_time",
    capacity: 1,
    skillsWanted: ["Solidity", "TypeScript", "Node.js", "React"],
    createdAt: now,
  },
  {
    id: "st-baytna",
    cycleId: cycle.id,
    name: "Baytna IoT",
    roleTitle: "Embedded Systems Intern",
    needsDescription:
      "Firmware and PCB bring-up for smart-home sensors. Embedded C on constrained hardware, some Python tooling.",
    employmentType: "full_time",
    capacity: 2,
    skillsWanted: ["Embedded C", "PCB Design", "Robotics", "Python"],
    createdAt: now,
  },
];

/* ---------------------------- candidates ---------------------------- */

type RawCandidate = {
  name: string;
  major: string;
  gpa: number;
  year: string;
  skills: string[];
  blurb: string;
  auth: number; // % AI-written
};

// 30 candidates with deliberate overlaps (contested picks) and a few
// strong-but-low-GPA profiles that become Hidden Gems.
const raw: RawCandidate[] = [
  { name: "Layla Al-Mansouri", major: "Computer Science", gpa: 3.9, year: "3rd year", skills: ["React", "TypeScript", "UI/UX", "Node.js"], blurb: "Frontend-focused CS student who ships polished, accessible interfaces.", auth: 4 },
  { name: "Omar Haddad", major: "Computer Engineering", gpa: 3.4, year: "2nd year", skills: ["Machine Learning", "Python", "Computer Vision"], blurb: "Builds small CV projects; interned on a plant-disease classifier.", auth: 46 },
  { name: "Yousef Karim", major: "Business Analytics", gpa: 3.2, year: "4th year", skills: ["Marketing", "SEO", "Content", "Growth"], blurb: "Ran growth for a student marketplace to 5k users.", auth: 88 },
  { name: "Rima Saleh", major: "Design & Computing", gpa: 2.7, year: "3rd year", skills: ["React", "TypeScript", "UI/UX", "Figma"], blurb: "Self-taught frontend with a standout portfolio; grades dipped while freelancing.", auth: 9 },
  { name: "Bilal Nasser", major: "Computer Science", gpa: 2.5, year: "4th year", skills: ["Machine Learning", "Python", "Computer Vision", "NLP"], blurb: "Kaggle competitor; strong ML fundamentals, uneven transcript.", auth: 14 },
  { name: "Nour Fakhoury", major: "Statistics", gpa: 2.9, year: "3rd year", skills: ["Python", "Data Analysis", "SQL"], blurb: "Loves messy data; built a clinic no-show model as a side project.", auth: 22 },
  { name: "Sara Al-Kuwari", major: "Computer Science", gpa: 3.8, year: "2nd year", skills: ["React", "TypeScript", "Node.js"], blurb: "Full-stack leaning frontend; maintains an open-source component set.", auth: 31 },
  { name: "Khalid Rahman", major: "Electrical Engineering", gpa: 3.5, year: "4th year", skills: ["Embedded C", "PCB Design", "Robotics"], blurb: "Hardware tinkerer; led a robotics club to a regional final.", auth: 7 },
  { name: "Maryam Al-Sulaiti", major: "Data Science", gpa: 3.7, year: "3rd year", skills: ["Python", "Data Analysis", "SQL", "Machine Learning"], blurb: "Bridges analysis and ML; clear communicator of results.", auth: 18 },
  { name: "Adam Cohen", major: "Computer Science", gpa: 3.3, year: "2nd year", skills: ["Solidity", "TypeScript", "Node.js"], blurb: "Wrote and audited toy DeFi contracts; security-minded.", auth: 52 },
  { name: "Hana Zayed", major: "Marketing", gpa: 3.6, year: "3rd year", skills: ["Marketing", "Content", "SEO"], blurb: "Content-first marketer; grew a newsletter to 12k readers.", auth: 63 },
  { name: "Ivan Petrov", major: "Computer Engineering", gpa: 3.1, year: "4th year", skills: ["Embedded C", "Python", "Robotics"], blurb: "Firmware intern last summer; comfortable on the oscilloscope.", auth: 11 },
  { name: "Fatima Darwish", major: "Computer Science", gpa: 3.95, year: "3rd year", skills: ["React", "TypeScript", "UI/UX"], blurb: "Top of cohort; obsessive about interaction detail.", auth: 3 },
  { name: "Tariq Mahmoud", major: "Data Science", gpa: 3.0, year: "2nd year", skills: ["Python", "SQL", "Data Analysis"], blurb: "Dashboards and pipelines; pragmatic and fast.", auth: 41 },
  { name: "Salma Riad", major: "Design", gpa: 3.4, year: "3rd year", skills: ["UI/UX", "Figma", "Content"], blurb: "Product designer who codes enough to prototype in React.", auth: 27 },
  { name: "Daniel Okoro", major: "Computer Science", gpa: 3.6, year: "4th year", skills: ["Machine Learning", "Python", "NLP"], blurb: "NLP focus; fine-tuned a small Arabic sentiment model.", auth: 35 },
  { name: "Aisha Bousaid", major: "Computer Engineering", gpa: 2.8, year: "3rd year", skills: ["Machine Learning", "Computer Vision", "Python", "Robotics"], blurb: "Exceptional robotics-vision portfolio; GPA hurt by a rough first year.", auth: 12 },
  { name: "Marcus Lee", major: "Business", gpa: 3.2, year: "4th year", skills: ["Growth", "Marketing", "SEO", "Content"], blurb: "Analytical growth marketer; runs clean A/B tests.", auth: 58 },
  { name: "Zainab Hussain", major: "Computer Science", gpa: 3.7, year: "2nd year", skills: ["React", "Node.js", "TypeScript", "Solidity"], blurb: "Full-stack + curious about web3; hackathon regular.", auth: 24 },
  { name: "Ethan Brown", major: "Electrical Engineering", gpa: 3.3, year: "3rd year", skills: ["PCB Design", "Embedded C"], blurb: "Designs tidy boards; strong soldering and bring-up.", auth: 16 },
  { name: "Dana Halabi", major: "Statistics", gpa: 3.5, year: "4th year", skills: ["Python", "Data Analysis", "Machine Learning", "SQL"], blurb: "Rigorous analyst moving into applied ML.", auth: 29 },
  { name: "Faisal Al-Naimi", major: "Computer Science", gpa: 3.1, year: "3rd year", skills: ["Solidity", "React", "TypeScript"], blurb: "Built an NFT ticketing demo end-to-end.", auth: 71 },
  { name: "Reem Ashkar", major: "Marketing", gpa: 3.8, year: "2nd year", skills: ["Content", "SEO", "Marketing", "Growth"], blurb: "Writer-marketer; ranks pages and reads the analytics.", auth: 44 },
  { name: "Hassan Ali", major: "Computer Engineering", gpa: 2.6, year: "4th year", skills: ["Embedded C", "PCB Design", "Robotics", "Python"], blurb: "Deep hardware skills; transcript doesn't show the half of it.", auth: 8 },
  { name: "Grace Mensah", major: "Computer Science", gpa: 3.6, year: "3rd year", skills: ["Python", "Machine Learning", "Data Analysis"], blurb: "Clean notebooks; strong at feature engineering.", auth: 33 },
  { name: "Noah Schmidt", major: "Computer Science", gpa: 3.2, year: "2nd year", skills: ["React", "TypeScript", "UI/UX", "Node.js"], blurb: "Frontend generalist with good product instincts.", auth: 49 },
  { name: "Lina Toubasi", major: "Design & Computing", gpa: 3.4, year: "3rd year", skills: ["UI/UX", "Figma", "React"], blurb: "Designs and builds; strong motion/interaction sense.", auth: 19 },
  { name: "Abdullah Salem", major: "Data Science", gpa: 3.0, year: "4th year", skills: ["SQL", "Python", "Data Analysis"], blurb: "Warehouse and BI leaning; loves a clean query.", auth: 55 },
  { name: "Mona El-Sayed", major: "Computer Science", gpa: 3.9, year: "3rd year", skills: ["Machine Learning", "Python", "Computer Vision"], blurb: "Research-grade CV work; published a workshop paper.", auth: 6 },
  { name: "Peter Novak", major: "Business", gpa: 3.3, year: "4th year", skills: ["Growth", "Marketing", "Content"], blurb: "Lifecycle and retention focus; scrappy experimenter.", auth: 67 },
];

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "");
}

const answerTemplates = [
  "I want to work on a real product with real users, not another class project.",
  "I shipped it solo — design, build, and the unglamorous debugging at 2am.",
  "How experienced engineers make trade-offs under a deadline.",
];

export const applications: Application[] = raw.map((c, i) => {
  const id = `app-${String(i + 1).padStart(2, "0")}`;
  return {
    id,
    cycleId: cycle.id,
    name: c.name,
    email: `${slug(c.name)}@qu.edu.qa`,
    gpa: c.gpa,
    year: c.year,
    major: c.major,
    skills: c.skills,
    blurb: c.blurb,
    answers: {
      q1: answerTemplates[0],
      q2: answerTemplates[1],
      q3: answerTemplates[2],
    },
    resumeFileName: `${slug(c.name)}-resume.pdf`,
    aiAuthenticityScore: c.auth,
    aiAuthenticityRationale:
      c.auth <= 30
        ? "Personal voice, specific details, and natural imperfections read as human-written."
        : c.auth <= 65
          ? "Mixed signals — some passages are polished in a way consistent with AI assistance."
          : "Highly uniform phrasing and generic structure consistent with AI generation.",
    createdAt: now,
  };
});

/* --------------------------- match engine --------------------------- */

/** Small deterministic hash → stable per-pair jitter (no Math.random). */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295; // 0..1
}

const NAIVE_GPA_CUTOFF = 3.0; // a traditional filter would reject below this
const HIDDEN_GEM_FIT = 79; // strong fit that a naive GPA<3.0 filter would reject

/**
 * Build a Match for one candidate against one startup, from skill overlap
 * plus a stable jitter. Hidden gems = strong fit that a naive GPA filter kills.
 */
export function buildMatch(app: Application, startup: Startup): Match {
  const overlap = startup.skillsWanted.filter((s) => app.skills.includes(s));
  const coverage = overlap.length / startup.skillsWanted.length;
  const jitter = hash(app.id + startup.id) * 16 - 8; // ±8
  let fitScore = Math.round(coverage * 74 + 20 + jitter);
  fitScore = Math.max(28, Math.min(97, fitScore));

  const reasons: string[] = [];
  if (overlap.length) {
    reasons.push(`Directly matches ${overlap.slice(0, 2).join(" & ")}`);
  }
  if (overlap.length >= 3) {
    reasons.push(`Covers ${overlap.length}/${startup.skillsWanted.length} of the role's core skills`);
  }
  if (app.gpa >= 3.5) reasons.push(`Strong academic record (${app.gpa.toFixed(1)} GPA)`);
  if (reasons.length < 2) reasons.push(app.blurb);

  const isHiddenGem = fitScore >= HIDDEN_GEM_FIT && app.gpa < NAIVE_GPA_CUTOFF;

  return {
    id: `m-${app.id}-${startup.id}`,
    applicationId: app.id,
    startupId: startup.id,
    fitScore,
    fitReasons: reasons.slice(0, 3),
    isHiddenGem,
    shortlistStatus: "under_review",
    authenticityScore: app.aiAuthenticityScore,
  };
}

export const matches: Match[] = applications.flatMap((app) =>
  startups.map((st) => buildMatch(app, st))
);
