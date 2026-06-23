import { VERDICT_LABELS } from "@/lib/policy";
import type { Verdict } from "@/lib/schema";

const STYLES: Record<Verdict, string> = {
  compliant: "bg-green-100 text-compliant border border-green-300",
  exceeds: "bg-red-100 text-exceeds border border-red-300",
  needs_review: "bg-orange-100 text-review border border-orange-300",
};

const ICONS: Record<Verdict, string> = {
  compliant: "✓",
  exceeds: "✕",
  needs_review: "?",
};

export default function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${STYLES[verdict]}`}
    >
      <span>{ICONS[verdict]}</span>
      <span>{VERDICT_LABELS[verdict]}</span>
    </span>
  );
}
