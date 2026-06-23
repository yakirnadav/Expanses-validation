import { downloadCsv } from "@/lib/csvExport";
import type { ProcessedReceipt } from "@/lib/schema";

export default function ExportButton({ receipts }: { receipts: ProcessedReceipt[] }) {
  const hasResults = receipts.some((r) => r.status === "done");

  return (
    <button
      disabled={!hasResults}
      onClick={() => downloadCsv(receipts)}
      className="bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
    >
      ייצוא ל-CSV
    </button>
  );
}
