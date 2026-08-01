import { cn } from "@/lib/utils";

type AuthenticityBadgeProps = {
  /** Percent of the application estimated AI-written (0 = human, 100 = AI). */
  pct: number;
  /** Show a trailing text label alongside the percentage. */
  showLabel?: boolean;
  className?: string;
};

type Tier = {
  dot: string;
  text: string;
  bg: string;
  label: string;
};

function tierFor(pct: number): Tier {
  if (pct <= 30)
    return {
      dot: "bg-auth-green",
      text: "text-auth-green",
      bg: "bg-auth-green-soft",
      label: "Likely human",
    };
  if (pct <= 65)
    return {
      dot: "bg-auth-amber",
      text: "text-auth-amber",
      bg: "bg-auth-amber-soft",
      label: "Mixed signals",
    };
  return {
    dot: "bg-auth-red",
    text: "text-auth-red",
    bg: "bg-auth-red-soft",
    label: "Likely AI-written",
  };
}

/** Pill badge on the diverging green -> amber -> red authenticity scale. */
export function AuthenticityBadge({
  pct,
  showLabel = false,
  className,
}: AuthenticityBadgeProps) {
  const t = tierFor(pct);
  return (
    <span
      className={cn(
        "inline-flex h-[26px] w-fit items-center gap-2 rounded-full px-2.5",
        t.bg,
        className
      )}
      title={`${t.label} · ${Math.round(pct)}% AI-written`}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
      <span className={cn("text-xs font-medium tabular-nums", t.text)}>
        {Math.round(pct)}%
      </span>
      {showLabel && (
        <span className={cn("text-xs font-medium", t.text)}>{t.label}</span>
      )}
    </span>
  );
}
