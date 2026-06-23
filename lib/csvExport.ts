import { CATEGORY_LABELS, VERDICT_LABELS } from "./policy";
import type { ProcessedReceipt } from "./schema";

const HEADERS = [
  "שם קובץ",
  "ספק",
  "מספר עוסק מורשה",
  "מספר חשבונית",
  "עובד",
  "מחלקה",
  "תאריך",
  "קטגוריה",
  "סכום לפני מע\"מ",
  "סכום מע\"מ",
  "שיעור מע\"מ",
  "סכום כולל",
  "אמצעי תשלום",
  "משתתפים",
  "מטרה עסקית",
  "פסיקה",
  "הפרות",
  "הערות",
];

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsv(receipts: ProcessedReceipt[]): string {
  const rows = receipts
    .filter((r) => r.status === "done")
    .map((r) =>
      [
        r.fileName,
        r.vendor ?? "",
        r.businessNumber ?? "",
        r.invoiceNumber ?? "",
        r.employee ?? "",
        r.department ?? "",
        r.date ?? "",
        CATEGORY_LABELS[r.category] ?? r.category,
        r.amountBeforeVat?.toString() ?? "",
        r.vatAmount?.toString() ?? "",
        r.vatRate?.toString() ?? "",
        r.total?.toString() ?? "",
        r.paymentMethod ?? "",
        r.participants?.join("; ") ?? "",
        r.businessPurpose ?? "",
        VERDICT_LABELS[r.verdict] ?? r.verdict,
        r.violations.map((v) => `${v.rule}: ${v.detail}`).join(" | "),
        r.notes ?? "",
      ]
        .map((cell) => escapeCsv(String(cell)))
        .join(",")
    );

  // BOM למניעת בעיות קידוד עברית באקסל
  return "﻿" + [HEADERS.join(","), ...rows].join("\n");
}

export function downloadCsv(receipts: ProcessedReceipt[]) {
  const csv = buildCsv(receipts);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ביקורת-הוצאות-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
