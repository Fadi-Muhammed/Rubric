import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, animate } from "framer-motion";
import { cn } from "@/lib/utils";

type ScoreDialProps = {
  /** 0–100, or null for an empty state. */
  value: number | null;
  /** Outer diameter in px. */
  size?: number;
  /** Arc/track stroke width in px. */
  strokeWidth?: number;
  /** Delay before the count-up begins (for staggered reveals). */
  delay?: number;
  className?: string;
};

/**
 * Radial score dial — the Rubric signature motif.
 * Track = hairline. Arc = accent, round cap, starts at 12 o'clock, sweeps clockwise.
 * Value renders in Fraunces and counts up. Empty state keeps the track + em-dash.
 */
export function ScoreDial({
  value,
  size = 44,
  strokeWidth = 4,
  delay = 0,
  className,
}: ScoreDialProps) {
  const reduce = useReducedMotion();
  const r = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * r;
  const target = value == null ? 0 : Math.max(0, Math.min(100, value));

  const offset = useMotionValue(circumference);
  const [display, setDisplay] = useState(reduce ? target : 0);
  const numberRef = useRef(target);

  useEffect(() => {
    if (value == null) {
      offset.set(circumference);
      return;
    }
    if (reduce) {
      offset.set(circumference * (1 - target / 100));
      setDisplay(target);
      return;
    }
    const controls = animate(offset, circumference * (1 - target / 100), {
      delay,
      type: "spring",
      stiffness: 120,
      damping: 22,
    });
    const num = animate(numberRef.current, target, {
      delay,
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    numberRef.current = target;
    return () => {
      controls.stop();
      num.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, target, delay, circumference, reduce]);

  // Font size scales with the dial so the number stays optically centered.
  const fontSize = Math.round(size * 0.32);

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--hairline)"
          strokeWidth={strokeWidth}
        />
        {value != null && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: offset }}
          />
        )}
      </svg>
      <div
        className="absolute inset-0 grid place-items-center font-display tracking-tight"
        style={{ fontSize }}
      >
        {value == null ? (
          <span className="font-mono text-secondary" style={{ fontSize: fontSize * 0.8 }}>
            —
          </span>
        ) : (
          display
        )}
      </div>
    </div>
  );
}
