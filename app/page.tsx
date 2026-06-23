"use client";

import { useCallback, useState } from "react";
import UploadZone from "@/components/UploadZone";
import SummaryCards from "@/components/SummaryCards";
import ResultsTable from "@/components/ResultsTable";
import ReceiptDetailModal from "@/components/ReceiptDetailModal";
import ExportButton from "@/components/ExportButton";
import { applyCrossReceiptChecks } from "@/lib/smartChecks";
import type { ExtractedReceipt, ProcessedReceipt } from "@/lib/schema";

function fileToBase64(file: File): Promise<{ base64Data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(",")[1];
      resolve({ base64Data, mediaType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function Home() {
  const [receipts, setReceipts] = useState<ProcessedReceipt[]>([]);
  const [selected, setSelected] = useState<ProcessedReceipt | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    setIsProcessing(true);

    const newReceipts: ProcessedReceipt[] = files.map((file) => ({
      id: makeId(),
      fileName: file.name,
      previewUrl: URL.createObjectURL(file),
      status: "pending",
      vendor: null,
      businessNumber: null,
      invoiceNumber: null,
      employee: null,
      department: null,
      date: null,
      category: "unknown",
      amountBeforeVat: null,
      vatAmount: null,
      vatRate: null,
      total: null,
      paymentMethod: null,
      participants: null,
      businessPurpose: null,
      verdict: "needs_review",
      violations: [],
      notes: "",
    }));

    setReceipts((prev) => [...prev, ...newReceipts]);

    for (let i = 0; i < files.length; i++) {
      const receipt = newReceipts[i];
      const file = files[i];

      setReceipts((prev) =>
        prev.map((r) => (r.id === receipt.id ? { ...r, status: "processing" } : r))
      );

      try {
        const { base64Data, mediaType } = await fileToBase64(file);
        const res = await fetch("/api/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64Data, mediaType }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "שגיאה לא ידועה" }));
          throw new Error(err.error ?? "שגיאה בעיבוד הקבלה");
        }

        const extracted: ExtractedReceipt = await res.json();

        setReceipts((prev) => {
          const updated = prev.map((r) =>
            r.id === receipt.id ? { ...r, ...extracted, status: "done" as const } : r
          );
          return applyCrossReceiptChecks(updated);
        });
      } catch (error: any) {
        setReceipts((prev) =>
          prev.map((r) =>
            r.id === receipt.id
              ? { ...r, status: "error", errorMessage: error?.message ?? "שגיאה" }
              : r
          )
        );
      }
    }

    setIsProcessing(false);
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand">Expense Auditor</h1>
          <p className="text-gray-500 mt-1">ביקורת אוטומטית של קבלות הוצאות מול מדיניות החברה</p>
        </div>
        <ExportButton receipts={receipts} />
      </header>

      <UploadZone onFilesSelected={handleFilesSelected} disabled={isProcessing} />

      {receipts.length > 0 && (
        <>
          <SummaryCards receipts={receipts} />
          <ResultsTable receipts={receipts} onSelect={setSelected} />
        </>
      )}

      {selected && <ReceiptDetailModal receipt={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
