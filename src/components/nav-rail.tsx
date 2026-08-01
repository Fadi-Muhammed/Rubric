import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FilePlus2,
  Sparkles,
  LayoutGrid,
  Gem,
  SwatchBook,
  Search,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useTheme, type Theme } from "./theme-provider";
import { OPEN_EVENT } from "./command-palette";
import { cn } from "@/lib/utils";

const COLLAPSED = 64;
const EXPANDED = 240;

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const items = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/intake", label: "Intake Builder", Icon: FilePlus2 },
  { to: "/match", label: "Match Pool", Icon: Sparkles, match: "/match" },
  { to: "/allocation", label: "Allocation Board", Icon: LayoutGrid },
  { to: "/gems", label: "Hidden Gems", Icon: Gem },
  { to: "/style", label: "Style Guide", Icon: SwatchBook },
];

/** Slide-in label that only renders while the rail is expanded. */
function Label({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.span
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          transition={spring}
          className="whitespace-nowrap text-sm font-medium"
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

const themeCycle: Record<Theme, Theme> = {
  light: "dark",
  dark: "system",
  system: "light",
};
const themeIcon = { light: Sun, dark: Moon, system: Monitor } as const;

export function NavRail() {
  const [expanded, setExpanded] = useState(false);
  const { pathname } = useLocation();
  const { theme, setTheme } = useTheme();
  const ThemeIcon = themeIcon[theme];

  return (
    <motion.aside
      onHoverStart={() => setExpanded(true)}
      onHoverEnd={() => setExpanded(false)}
      animate={{ width: expanded ? EXPANDED : COLLAPSED }}
      transition={spring}
      className="sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-hairline bg-surface"
      style={{ width: COLLAPSED }}
    >
      {/* Wordmark */}
      <div className="flex h-16 items-center gap-3 overflow-hidden px-[22px]">
        <span className="grid h-5 w-5 shrink-0 place-items-center font-display text-h4 leading-none">
          R
        </span>
        <Label show={expanded}>
          <span className="font-display text-h4">Rubric</span>
        </Label>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
        {items.map(({ to, label, Icon, match }) => {
          const active = match ? pathname.startsWith(match) : pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "group/item relative flex h-11 items-center gap-3 overflow-hidden rounded-md px-[10px] outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-accent",
                active
                  ? "text-accent"
                  : "text-secondary hover:bg-row-hover hover:text-ink"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  transition={spring}
                  className="absolute inset-0 rounded-md bg-accent-soft"
                />
              )}
              <Icon
                className="relative z-10 h-5 w-5 shrink-0"
                strokeWidth={1.5}
              />
              <span className="relative z-10">
                <Label show={expanded}>{label}</Label>
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: theme + Ctrl-K hint */}
      <div className="flex flex-col gap-1 border-t border-hairline p-3">
        <button
          onClick={() => setTheme(themeCycle[theme])}
          aria-label={`Theme: ${theme}. Click to switch.`}
          className="flex h-11 items-center gap-3 overflow-hidden rounded-md px-[10px] text-secondary outline-none transition-colors hover:bg-row-hover hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ThemeIcon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
          <Label show={expanded}>
            <span className="capitalize">{theme}</span>
          </Label>
        </button>
        <button
          onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
          aria-label="Open command palette"
          className="flex h-11 items-center gap-3 overflow-hidden rounded-md px-[10px] text-secondary outline-none transition-colors hover:bg-row-hover hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Search className="h-5 w-5 shrink-0" strokeWidth={1.5} />
          <Label show={expanded}>
            <span className="flex items-center gap-2 text-sm">
              Search
              <kbd className="rounded border border-hairline bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-secondary">
                Ctrl K
              </kbd>
            </span>
          </Label>
        </button>
      </div>
    </motion.aside>
  );
}
