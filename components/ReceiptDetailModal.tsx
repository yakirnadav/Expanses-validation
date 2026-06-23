import { CATEGORY_LABELS } from "@/lib/policy";
import type { ProcessedReceipt } from "@/lib/schema";
import VerdictBadge from "./VerdictBadge";

const SEVERITY_LABELS: Record<string, string> = { high: "חמורה", medium: "בינונית", low: "נמוכה" };
const SEVERITY_COLORS: Record<string, string> = {
  high: "text-exceeds",
  medium: "text-review",
  low: "text-gray-500",
};

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm font-medium text-gray-800">{value ?? "—"}</div>
    </div>
  );
}

export default function ReceiptDetailModal({
  receipt,
  onClose,
}: {
  receipt: ProcessedReceipt;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{receipt.fileName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ✕
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-5">
          <div className="bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px]">
            {receipt.previewUrl.endsWith("application/pdf") || receipt.fileName.toLowerCase().endsWith(".pdf") ? (
              <iframe src={receipt.previewUrl} className="w-full h-[400px]" />
            ) : (
              <img src={receipt.previewUrl} alt={receipt.fileName} className="max-h-[400px] object-contain" />
            )}
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <VerdictBadge verdict={receipt.verdict} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="ספק" value={receipt.vendor} />
              <Field label="מספר עוסק מורשה" value={receipt.businessNumber} />
              <Field label="מספר חשבונית" value={receipt.invoiceNumber} />
              <Field label="עובד" value={receipt.employee} />
              <Field label="מחלקה" value={receipt.department} />
              <Field label="תאריך" value={receipt.date} />
              <Field label="קטגוריה" value={CATEGORY_LABELS[receipt.category] ?? receipt.category} />
              <Field label="אמצעי תשלום" value={receipt.paymentMethod} />
              <Field label="סכום לפני מע&quot;מ" value={receipt.amountBeforeVat} />
              <Field label="מע&quot;מ" value={receipt.vatAmount} />
              <Field label="שיעור מע&quot;מ" value={receipt.vatRate != null ? `${receipt.vatRate}%` : null} />
              <Field label="סכום כולל" value={receipt.total} />
            </div>

            <Field label="משתתפים" value={receipt.participants?.join(", ")} />
            <Field label="מטרה עסקית" value={receipt.businessPurpose} />

            {receipt.violations.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-2">הפרות שזוהו</div>
                <ul className="space-y-2">
                  {receipt.violations.map((v, i) => (
                    <li key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                      <span className={`font-semibold ${SEVERITY_COLORS[v.severity]}`}>
                        [{SEVERITY_LABELS[v.severity]}] {v.rule}
                      </span>
                      <p className="text-gray-600 mt-1">{v.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {receipt.notes && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">הערות</div>
                <p className="text-sm text-gray-600">{receipt.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
