import { useParams } from "react-router-dom";

/** Public candidate application page — no recruiter chrome. */
export default function Apply() {
  const { cycleId } = useParams();
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-20">
        <span className="text-eyebrow font-medium uppercase tracking-[0.12em] text-secondary">
          Step 4 · Public
        </span>
        <h1 className="font-display text-h2 font-normal">Apply</h1>
        <p className="max-w-[60ch] text-body text-secondary">
          The public application form for cycle "{cycleId}" will render here — one
          shared application into the whole program pool.
        </p>
      </div>
    </main>
  );
}
