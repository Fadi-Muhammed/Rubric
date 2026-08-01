import {
  getCycle,
  getCycleStats,
  listStartups,
  listApplications,
  listMatches,
  listHiddenGems,
  getMatchesForStartup,
} from "@/lib/data";

/** Dev-only data-layer inspector. Confirms the seed loads and reads work. */
export default function Debug() {
  if (!import.meta.env.DEV) {
    return (
      <div className="px-8 py-20 text-secondary">Not available in production.</div>
    );
  }

  const cycle = getCycle();
  const stats = getCycleStats();
  const startups = listStartups();
  const gems = listHiddenGems();

  const counts: [string, number | string][] = [
    ["Cycle", cycle.name],
    ["Startups", stats.startups],
    ["Candidates", stats.candidates],
    ["Matches (grid)", stats.matches],
    ["Hidden gems", stats.hiddenGems],
    ["Shortlisted", stats.shortlisted],
    ["Applications loaded", listApplications().length],
    ["Matches loaded", listMatches().length],
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-8 py-14">
      <div className="flex flex-col gap-1">
        <span className="text-eyebrow font-medium uppercase tracking-[0.12em] text-secondary">
          Step 2 · dev only
        </span>
        <h1 className="font-display text-h2 font-normal">Data layer</h1>
      </div>

      {/* Counts */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {counts.map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-1 rounded-lg border border-hairline bg-surface p-4"
          >
            <span className="font-display text-h3">{value}</span>
            <span className="text-xs text-secondary">{label}</span>
          </div>
        ))}
      </section>

      {/* Per-startup top match */}
      <section className="flex flex-col gap-3">
        <span className="text-eyebrow font-medium uppercase tracking-[0.12em] text-secondary">
          Top match per startup
        </span>
        <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
          {startups.map((s, i) => {
            const top = getMatchesForStartup(s.id)[0];
            return (
              <div
                key={s.id}
                className={`grid grid-cols-[1fr_1fr_60px] items-center gap-4 px-4 py-3 text-sm ${
                  i < startups.length - 1 ? "border-b border-hairline" : ""
                }`}
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-secondary">{top?.application.name}</span>
                <span className="text-right font-mono">{top?.fitScore}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hidden gems */}
      <section className="flex flex-col gap-3">
        <span className="text-eyebrow font-medium uppercase tracking-[0.12em] text-secondary">
          Hidden gems ({gems.length})
        </span>
        <div className="flex flex-col gap-2">
          {gems.map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between rounded-lg border border-hairline bg-surface px-4 py-2.5 text-sm"
            >
              <span className="font-medium">{g.application.name}</span>
              <span className="text-secondary">
                GPA {g.application.gpa.toFixed(1)} · fit {g.fitScore} ·{" "}
                {listStartups().find((s) => s.id === g.startupId)?.name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
