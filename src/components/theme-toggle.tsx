import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "./theme-provider";
import { cn } from "@/lib/utils";

const options: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
];

/** Segmented light / system / dark control with a sliding indicator. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface p-1"
    >
      {options.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => setTheme(value)}
            className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded-full outline-none transition-colors",
              "focus-visible:ring-2 focus-visible:ring-accent",
              active ? "text-white" : "text-secondary hover:text-ink"
            )}
          >
            {active && (
              <motion.span
                layoutId="theme-indicator"
                className="absolute inset-0 rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <Icon className="relative z-10 h-[15px] w-[15px]" strokeWidth={1.5} />
          </button>
        );
      })}
    </div>
  );
}
