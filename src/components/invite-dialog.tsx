import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, Mail, ShieldAlert, Check, Loader2, Send } from "lucide-react";
import type { RankedMatch, Startup } from "@/data/types";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   InviteDialog — "Invite shortlisted to interview" confirmation.
   Previews the interview-invitation email that would go to every shortlisted
   candidate (real-looking seeded addresses), notes the future Outlook
   integration via composio.dev, then — on confirm — shows a SIMULATED
   "N invitations sent" success. No real email is sent; no network call is made.
--------------------------------------------------------------------------- */

type Phase = "preview" | "sending" | "sent";

type Props = {
  startup: Startup;
  targets: RankedMatch[]; // shortlisted candidates to invite
  onCancel: () => void;
  /** Optional hook to persist an "invited" state through the data layer. */
  onConfirm?: () => void;
};

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

/** The invitation email body previewed per candidate (and "sent" in the mock). */
function emailBody(app: RankedMatch["application"], startup: Startup): string {
  return [
    `Hi ${firstName(app.name)},`,
    `Great news — after reviewing a strong field for the ${startup.roleTitle} role at ${startup.name} through the QSTP shared talent pool, we'd like to move you forward. You've been shortlisted, and we'd love to meet you for an interview.`,
    `We'll follow up shortly with a few times that could work. In the meantime, feel free to reply with your availability over the coming week.`,
    `Looking forward to speaking,`,
    `— The ${startup.name} hiring team, via QSTP Rubric`,
  ].join("\n\n");
}

export function InviteDialog({ startup, targets, onCancel, onConfirm }: Props) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("preview");
  // Snapshot the recipient count at send time for the success headline.
  const [sentCount, setSentCount] = useState(0);

  // ESC to dismiss (only while not mid-send) + lock background scroll.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "sending") onCancel();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onCancel, phase]);

  const count = targets.length;

  const send = () => {
    if (phase !== "preview") return;
    setSentCount(count);
    setPhase("sending");
  };

  // Simulated send latency, owned by the component lifecycle (cleaned up on
  // unmount). Nothing leaves the browser.
  useEffect(() => {
    if (phase !== "sending") return;
    const t = window.setTimeout(
      () => {
        try {
          onConfirm?.();
        } catch (err) {
          console.error("[InviteDialog] onConfirm failed:", err);
        }
        setPhase("sent");
      },
      reduce ? 200 : 1400
    );
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const panelMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 16, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 16, scale: 0.98 },
        transition: { type: "spring" as const, stiffness: 320, damping: 30 },
      };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => phase !== "sending" && onCancel()}
      />

      <motion.div
        {...panelMotion}
        className="relative flex max-h-[82vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-hairline bg-elevated shadow-ambient"
        role="dialog"
        aria-modal="true"
        aria-label="Invite shortlisted candidates to interview"
      >
        {phase === "sent" ? (
          /* ----------------------------- success ----------------------------- */
          <motion.div
            key="sent"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 px-8 py-12 text-center"
          >
            <motion.span
              initial={reduce ? false : { scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 18 }}
              className="grid h-14 w-14 place-items-center rounded-full bg-auth-green-soft"
            >
              <Check className="h-7 w-7 text-auth-green" strokeWidth={2.5} />
            </motion.span>
            <div className="flex flex-col gap-1.5">
              <h2 className="font-display text-h3 font-normal tracking-tight">
                {sentCount} {sentCount === 1 ? "invitation" : "invitations"} sent
              </h2>
              <p className="max-w-[42ch] text-meta leading-relaxed text-secondary">
                {sentCount} shortlisted {sentCount === 1 ? "candidate was" : "candidates were"}{" "}
                invited to interview for {startup.name}.
              </p>
              <p className="mt-1 text-eyebrow text-secondary">
                Simulated — no email actually left the browser.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="mt-2 h-10 rounded-lg bg-accent px-5 text-meta font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Done
            </button>
          </motion.div>
        ) : (
          /* ------------------------- preview / sending ------------------------- */
          <div className="flex min-h-0 flex-col">
            {/* header */}
            <div className="flex flex-none items-start justify-between gap-4 border-b border-hairline p-6">
              <div className="flex flex-col gap-1.5">
                <h2 className="font-display text-h3 font-normal leading-tight tracking-tight">
                  Invite {count} shortlisted{" "}
                  {count === 1 ? "candidate" : "candidates"}
                </h2>
                <p className="text-meta leading-relaxed text-secondary">
                  Each shortlisted candidate for{" "}
                  <span className="font-medium text-ink">{startup.name}</span> gets the same warm
                  interview invitation.
                </p>
              </div>
              <button
                onClick={onCancel}
                disabled={phase === "sending"}
                className="grid h-7 w-7 flex-none place-items-center rounded-lg border border-hairline text-secondary transition-colors hover:border-accent hover:text-ink disabled:opacity-40"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.8} />
              </button>
            </div>

            {/* composio note */}
            <div className="flex flex-none items-start gap-2.5 border-b border-hairline bg-accent-soft px-6 py-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 flex-none text-accent" strokeWidth={1.8} />
              <p className="text-eyebrow leading-relaxed text-secondary">
                <span className="font-medium text-ink">Mocked for the demo.</span> No email is
                sent and no network call is made. A future step wires this to Outlook via
                composio.dev to deliver these for real.
              </p>
            </div>

            {/* email preview list */}
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {count === 0 ? (
                <p className="py-8 text-center text-meta text-secondary">
                  No shortlisted candidates yet — star a few first.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {targets.map((m) => (
                    <div
                      key={m.id}
                      className="flex flex-col gap-2 rounded-lg border border-hairline bg-surface p-4"
                    >
                      <div className="flex items-center gap-2 text-meta">
                        <Mail className="h-3.5 w-3.5 flex-none text-secondary" strokeWidth={1.8} />
                        <span className="font-medium">{m.application.name}</span>
                        <span className="truncate font-mono text-eyebrow text-secondary">
                          {m.application.email}
                        </span>
                      </div>
                      <div className="text-eyebrow text-secondary">
                        Subject:{" "}
                        <span className="text-ink">
                          You're shortlisted — interview for {startup.roleTitle} at {startup.name}
                        </span>
                      </div>
                      <p className="whitespace-pre-line border-l-2 border-hairline pl-3 text-eyebrow leading-relaxed text-secondary">
                        {emailBody(m.application, startup)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* footer actions */}
            <div className="flex flex-none items-center justify-between gap-3 border-t border-hairline p-5">
              <span className="text-eyebrow text-secondary">
                {count} recipient{count === 1 ? "" : "s"}
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onCancel}
                  disabled={phase === "sending"}
                  className="h-10 rounded-lg border border-hairline px-4 text-meta font-medium text-secondary transition-colors hover:border-accent hover:text-ink disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={send}
                  disabled={phase === "sending" || count === 0}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-meta font-medium text-white transition-colors",
                    phase === "sending" ? "cursor-wait opacity-80" : "hover:bg-accent-hover",
                    count === 0 && "cursor-not-allowed opacity-40"
                  )}
                >
                  {phase === "sending" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" strokeWidth={1.8} />
                      Send {count} {count === 1 ? "invite" : "invites"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
