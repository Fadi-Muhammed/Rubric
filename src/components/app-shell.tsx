import { Outlet } from "react-router-dom";
import { ChevronsUpDown, Command } from "lucide-react";
import { NavRail } from "./nav-rail";

/** Recruiter-facing chrome: icon rail + slim top strip + routed content. */
export function AppShell() {
  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <NavRail />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top strip — cycle switcher */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-hairline bg-canvas px-6">
          <button className="group flex items-center gap-2 rounded-md px-2 py-1.5 outline-none transition-colors hover:bg-row-hover focus-visible:ring-2 focus-visible:ring-accent">
            <span className="text-eyebrow font-medium uppercase tracking-[0.12em] text-secondary">
              Cycle
            </span>
            <span className="text-sm font-medium">Summer 2026 Internship Program</span>
            <ChevronsUpDown
              className="h-4 w-4 text-secondary transition-colors group-hover:text-ink"
              strokeWidth={1.5}
            />
          </button>

          <button
            aria-label="Open command palette"
            className="flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 text-secondary outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Command className="h-4 w-4" strokeWidth={1.5} />
            <kbd className="font-mono text-[11px]">⌘K</kbd>
          </button>
        </header>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
