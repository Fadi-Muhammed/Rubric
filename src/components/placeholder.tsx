import { motion } from "framer-motion";

type PlaceholderProps = {
  step: string;
  title: string;
  description: string;
};

/** Temporary screen scaffold — replaced by the real screen in a later step. */
export function Placeholder({ step, title, description }: PlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="mx-auto flex max-w-2xl flex-col gap-4 px-8 py-20"
    >
      <span className="text-eyebrow font-medium uppercase tracking-[0.12em] text-secondary">
        {step}
      </span>
      <h1 className="font-display text-h2 font-normal">{title}</h1>
      <p className="max-w-[60ch] text-body text-secondary">{description}</p>
      <div className="mt-4 flex flex-col gap-3">
        <div className="h-4 w-2/3 rounded-full bg-skeleton" />
        <div className="h-4 w-full rounded-full bg-skeleton" />
        <div className="h-4 w-1/2 rounded-full bg-skeleton" />
      </div>
    </motion.div>
  );
}
