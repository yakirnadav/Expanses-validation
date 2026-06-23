import { CATEGORY_LABELS } from "@/lib/policy";
import type { ProcessedReceipt } from "@/lib/schema";
import VerdictBadge from "./VerdictBadge";

const ROW_BG: Record<string, string> = {
  compliant: "hover:bg-green-50",
  exceeds: "hover:bg-red-50",
  needs_review: "hover:bg-orange-50",
};

interface ResultsTableProps {
  receipts: ProcessedReceipt[];
  onSelect: (receipt: ProcessedReceipt) => void;
}

export default function ResultsTable({ receipts, onSelect }: ResultsTableProps) {
  if (receipts.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full text-right">
        <thead className="bg-gray-100 text-gray-600 text-sm">
          <tr>
            <th className="p-3">קובץ</th>
            <th className="p-3">ספק</th>
            <th className="p-3">קטגוריה</th>
            <th className="p-3">תאריך</th>
            <th className="p-3">סכום</th>
            <th className="p-3">פסיקה</th>
            <th className="p-3">סיבה עיקרית</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {receipts.map((r) => (
            <tr
              key={r.id}
              onClick={() => r.status === "done" && onSelect(r)}
              className={`cursor-pointer transition-colors ${
                r.status === "done" ? ROW_BG[r.verdict] : ""
              }`}
            >
              <td className="p-3 text-sm text-gray-500 max-w-[160px] truncate">{r.fileName}</td>
              {r.status === "pending" && (
                <td colSpan={6} className="p-3 text-sm text-gray-400">ממתין בתור...</td>
              )}
              {r.status === "processing" && (
                <td colSpan={6} className="p-3 text-sm text-brand">מעבד עם Claude...</td>
              )}
              {r.status === "error" && (
                <td colSpan={6} className="p-3 text-sm text-exceeds">שגיאה: {r.errorMessage}</td>
              )}
              {r.status === "done" && (
                <>
                  <td className="p-3">{r.vendor ?? "—"}</td>
                  <td className="p-3">{CATEGORY_LABELS[r.category] ?? r.category}</td>
                  <td className="p-3">{r.date ?? "—"}</td>
                  <td className="p-3">{r.total != null ? `₪${r.total.toLocaleString("he-IL")}` : "—"}</td>
                  <td className="p-3">
                    <VerdictBadge verdict={r.verdict} />
                  </td>
                  <td className="p-3 text-sm text-gray-600 max-w-[280px] truncate">
                    {r.violations[0]?.detail ?? "—"}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
