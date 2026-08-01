import { useParams } from "react-router-dom";
import { Placeholder } from "@/components/placeholder";

export default function MatchPool() {
  const { startupId } = useParams();
  return (
    <Placeholder
      step="Step 5 — hero"
      title="Match Pool"
      description={`Ranked candidates for startup "${startupId}" with score dials, fit reasons, authenticity badges, and hidden-gem markers will render here.`}
    />
  );
}
