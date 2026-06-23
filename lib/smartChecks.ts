import { MONTHLY_CAPS, CATEGORY_LABELS } from "./policy";
import type { ProcessedReceipt } from "./schema";

function dayDiff(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 86_400_000;
}

/**
 * צבירה חודשית לפי קטגוריה+עובד, וזיהוי קבלות כפולות (ספק+עובד+סכום בטווח 7 ימים).
 * רץ לאחר שכל הקבלות חולצו, כי דורש מבט-על על כל המנה.
 */
export function applyCrossReceiptChecks(
  receipts: ProcessedReceipt[]
): ProcessedReceipt[] {
  const done = receipts.filter((r) => r.status === "done" && r.date);

  // צבירה חודשית לפי עובד+קטגוריה+חודש
  const monthlyTotals = new Map<string, number>();
  for (const r of done) {
    if (!r.date || r.total == null) continue;
    const month = r.date.slice(0, 7);
    const key = `${r.employee ?? "unknown"}|${r.category}|${month}`;
    monthlyTotals.set(key, (monthlyTotals.get(key) ?? 0) + r.total);
  }

  return receipts.map((r) => {
    if (r.status !== "done") return r;

    const violations = [...r.violations];
    let verdict = r.verdict;

    // בדיקת חריגה מתקרה חודשית
    if (r.date && r.total != null) {
      const month = r.date.slice(0, 7);
      const key = `${r.employee ?? "unknown"}|${r.category}|${month}`;
      const cap = MONTHLY_CAPS[r.category] ?? Infinity;
      const total = monthlyTotals.get(key) ?? 0;
      if (cap !== Infinity && total > cap) {
        violations.push({
          rule: "חריגה מתקרה חודשית",
          detail: `סך הוצאות ${CATEGORY_LABELS[r.category]} לעובד זה בחודש ${month} (₪${total.toFixed(
            2
          )}) חורג מהתקרה החודשית (₪${cap}).`,
          severity: "high",
        });
        if (verdict === "compliant") verdict = "exceeds";
      }
    }

    // זיהוי כפילויות: אותו ספק+עובד+סכום בטווח 7 ימים
    const duplicate = done.find(
      (other) =>
        other.id !== r.id &&
        other.vendor &&
        r.vendor &&
        other.vendor === r.vendor &&
        other.employee === r.employee &&
        other.total === r.total &&
        r.date &&
        other.date &&
        dayDiff(r.date, other.date) <= 7
    );
    if (duplicate) {
      violations.push({
        rule: "חשד לכפילות",
        detail: `קבלה דומה (אותו ספק, עובד וסכום) נמצאה בקובץ "${duplicate.fileName}" בטווח של 7 ימים.`,
        severity: "low",
      });
    }

    return { ...r, violations, verdict };
  });
}
