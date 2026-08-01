import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import { listStartups, getMatchesForStartup, listApplications, listMatches } from "@/lib/data";
import { useTheme, type Theme } from "./theme-provider";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Command palette (Ctrl+K) — fuzzy jump to any screen, host startup, or the
   Hidden Gems view, plus a few real quick actions. Opens on Ctrl/Cmd+K or the
   custom "rubric:command-palette" event dispatched by the rail hint and the
   top-strip button. Keyboard-driven: ↑/↓ to move, ↵ to run, esc to close.
   Adapted from mockups/CommandPalette.dc.html.
--------------------------------------------------------------------------- */

export const OPEN_EVENT = "rubric:command-palette";

type Command = {
  id: string;
  group: string;
  glyph: string;
  title: string;
  sub?: string;
  hint?: string;
  keywords?: string;
  run: () => void;
};

const themeCycle: Record<Theme, Theme> = { light: "dark", dark: "system", system: "light" };

/** Subsequence fuzzy score — higher is better, -1 means no match. */
function fuzzyScore(query: string, text: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  let score = 0;
  let streak = 0;
  let prevIdx = -1;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      streak = prevIdx === ti - 1 ? streak + 1 : 1;
      score += streak * 2 + (ti === 0 || t[ti - 1] === " " ? 3 : 0);
      prevIdx = ti;
      qi++;
    }
  }
  return qi === q.length ? score : -1;
}

export function CommandPalette() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const reduce = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Open on Ctrl/Cmd+K anywhere, and on the shared custom event.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  // Reset + focus each time it opens; lock background scroll.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);
  const runAndClose = (fn: () => void) => {
    close();
    fn();
  };

  // The full command set — navigation, host startups, actions.
  const commands = useMemo<Command[]>(() => {
    const startups = listStartups();
    const screens: Command[] = [
      { id: "nav-dashboard", group: "Go to", glyph: "DB", title: "Dashboard", sub: "Open roles overview", keywords: "home roles", run: () => navigate("/dashboard") },
      { id: "nav-allocation", group: "Go to", glyph: "AB", title: "Allocation Board", sub: "Assign the whole pool", keywords: "assign allocate columns", run: () => navigate("/allocation") },
      { id: "nav-gems", group: "Go to", glyph: "◆", title: "Hidden Gems", sub: "Strong fits a GPA filter would miss", keywords: "hidden gems overlooked", run: () => navigate("/gems") },
      { id: "nav-intake", group: "Go to", glyph: "+", title: "Intake Builder", sub: "3-step role builder", keywords: "new role add startup create", run: () => navigate("/intake") },
    ];
    const startupCmds: Command[] = startups.map((s) => {
      const count = getMatchesForStartup(s.id).length;
      const initials = s.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
      return {
        id: `st-${s.id}`,
        group: "Host startups",
        glyph: initials,
        title: s.name,
        sub: `${s.roleTitle} · ${count} applicants`,
        hint: "Rank pool",
        keywords: `${s.roleTitle} ${s.skillsWanted.join(" ")}`,
        run: () => navigate(`/match/${s.id}`),
      };
    });
    // Candidate profiles — each jumps to its best-fit role's Match Pool and
    // deep-opens the profile drawer (?open=<matchId>). Every candidate has a
    // match against every startup, so the target row always resolves.
    const allMatches = listMatches();
    const bestByApp = new Map<string, (typeof allMatches)[number]>();
    for (const m of allMatches) {
      const cur = bestByApp.get(m.applicationId);
      if (!cur || m.fitScore > cur.fitScore) bestByApp.set(m.applicationId, m);
    }
    const candidateCmds: Command[] = listApplications().map((a) => {
      const best = bestByApp.get(a.id);
      const st = best ? startups.find((s) => s.id === best.startupId) : undefined;
      const initials = a.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
      return {
        id: `cand-${a.id}`,
        group: "Candidates",
        glyph: initials,
        title: a.name,
        sub: `${a.major} · GPA ${a.gpa.toFixed(1)}${st ? ` · best fit ${st.name.split(" ")[0]}` : ""}`,
        hint: best ? `Fit ${best.fitScore}` : undefined,
        keywords: `${a.skills.join(" ")} ${a.major} ${a.year} candidate applicant profile ${st?.name ?? ""}`,
        run: () =>
          best && st ? navigate(`/match/${st.id}?open=${best.id}`) : navigate("/gems"),
      };
    });
    const actions: Command[] = [
      { id: "act-new", group: "Actions", glyph: "+", title: "New role", sub: "Opens the 3-step builder", hint: "Ctrl N", keywords: "add startup create", run: () => navigate("/intake") },
      {
        id: "act-theme",
        group: "Actions",
        glyph: "◐",
        title: "Toggle appearance",
        sub: `Currently ${theme}`,
        hint: "Ctrl ⇧ L",
        keywords: "dark light system theme",
        run: () => setTheme(themeCycle[theme]),
      },
    ];
    return [...screens, ...startupCmds, ...candidateCmds, ...actions];
  }, [navigate, setTheme, theme]);

  // Filter + rank. Empty query keeps stable authoring order, but hides the long
  // candidate list on open — candidates surface once the user starts typing.
  const filtered = useMemo(() => {
    if (!query.trim()) return commands.filter((c) => c.group !== "Candidates");
    return commands
      .map((c) => ({ c, s: fuzzyScore(query, `${c.title} ${c.sub ?? ""} ${c.keywords ?? ""}`) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.c);
  }, [commands, query]);

  // Clamp the active index whenever the result set changes.
  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  // Keep the active row visible.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (filtered.length ? (a + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (filtered.length ? (a - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[active];
      if (cmd) runAndClose(cmd.run);
    }
  };

  // Group the filtered results while preserving each item's flat index.
  const groups = useMemo(() => {
    const out: { label: string; items: { cmd: Command; idx: number }[] }[] = [];
    filtered.forEach((cmd, idx) => {
      let g = out.find((x) => x.label === cmd.group);
      if (!g) {
        g = { label: cmd.group, items: [] };
        out.push(g);
      }
      g.items.push({ cmd, idx });
    });
    return out;
  }, [filtered]);

  // NB: plain conditional render (no AnimatePresence). An AnimatePresence exit
  // on this panel deadlocks — the element never leaves the DOM on close — so we
  // animate the entrance only and unmount instantly. Same lesson as the intake
  // step wrapper and the reject dialog.
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        onClick={close}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        onKeyDown={onKeyDown}
        className="relative flex max-h-[70vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl border border-hairline bg-elevated shadow-ambient"
      >
            {/* input */}
            <div className="flex flex-none items-center gap-3 border-b border-hairline px-[18px] py-3.5">
              <Search className="h-[17px] w-[17px] flex-none text-secondary" strokeWidth={1.5} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="Search candidates, roles, startups, actions"
                className="flex-1 bg-transparent text-body text-ink outline-none placeholder:text-secondary"
              />
              <kbd className="flex-none rounded bg-skeleton px-1.5 py-1 font-mono text-eyebrow text-secondary">
                esc
              </kbd>
            </div>

            {/* results */}
            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <p className="px-5 py-10 text-center text-meta text-secondary">
                  No matches for "{query}".
                </p>
              ) : (
                groups.map((g) => (
                  <div key={g.label} className="flex flex-col">
                    <div className="px-[18px] pb-1.5 pt-2.5 text-eyebrow font-medium uppercase tracking-[0.1em] text-secondary">
                      {g.label}
                    </div>
                    {g.items.map(({ cmd, idx }) => {
                      const sel = idx === active;
                      return (
                        <button
                          key={cmd.id}
                          data-idx={idx}
                          onClick={() => runAndClose(cmd.run)}
                          onMouseMove={() => setActive(idx)}
                          className={cn(
                            "mx-2 flex items-center gap-3.5 rounded-lg px-2.5 py-2.5 text-left transition-colors",
                            sel ? "bg-accent-soft shadow-[inset_2px_0_0_var(--accent)]" : "hover:bg-row-hover"
                          )}
                        >
                          <span
                            className={cn(
                              "grid h-[26px] w-[26px] flex-none place-items-center rounded-lg font-mono text-eyebrow font-medium",
                              sel ? "bg-accent-soft text-accent" : "bg-skeleton text-secondary"
                            )}
                          >
                            {cmd.glyph}
                          </span>
                          <span className="flex min-w-0 flex-1 items-baseline gap-2">
                            <span className="truncate text-meta font-medium text-ink">{cmd.title}</span>
                            {cmd.sub && (
                              <span className="truncate text-eyebrow text-secondary">{cmd.sub}</span>
                            )}
                          </span>
                          {cmd.hint && (
                            <span
                              className={cn(
                                "flex-none font-mono text-eyebrow",
                                sel ? "text-accent" : "text-secondary"
                              )}
                            >
                              {cmd.hint}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* footer */}
            <div className="flex flex-none items-center justify-between border-t border-hairline px-[18px] py-2.5 text-eyebrow text-secondary">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded bg-skeleton px-1.5 py-0.5 font-mono">↵</kbd> Open
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded bg-skeleton px-1.5 py-0.5 font-mono">↑↓</kbd> Navigate
                </span>
              </div>
              <span>
                {filtered.length} {filtered.length === 1 ? "result" : "results"}
              </span>
            </div>
      </motion.div>
    </div>
  );
}
