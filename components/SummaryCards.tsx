import type { ProcessedReceipt } from "@/lib/schema";

export default function SummaryCards({ receipts }: { receipts: ProcessedReceipt[] }) {
  const done = receipts.filter((r) => r.status === "done");
  const compliant = done.filter((r) => r.verdict === "compliant").length;
  const exceeds = done.filter((r) => r.verdict === "exceeds").length;
  const review = done.filter((r) => r.verdict === "needs_review").length;
  const total = done.reduce((sum, r) => sum + (r.total ?? 0), 0);

  const cards = [
    { label: "סך קבלות", value: receipts.length, color: "text-gray-800" },
    { label: "תואם", value: compliant, color: "text-compliant" },
    { label: "חורג", value: exceeds, color: "text-exceeds" },
    { label: "דורש בדיקה", value: review, color: "text-review" },
    { label: "סכום כולל", value: `₪${total.toLocaleString("he-IL", { maximumFractionDigits: 0 })}`, color: "text-brand" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
          <div className="text-sm text-gray-500 mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
