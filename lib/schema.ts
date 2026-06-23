export type ExpenseCategory =
  | "meals"
  | "lodging"
  | "taxi"
  | "office_supplies"
  | "training"
  | "client_gifts"
  | "other"
  | "unknown";

export type Verdict = "compliant" | "exceeds" | "needs_review";

export type Severity = "high" | "medium" | "low";

export interface Violation {
  rule: string;
  detail: string;
  severity: Severity;
}

export interface ExtractedReceipt {
  vendor: string | null;
  businessNumber: string | null;
  invoiceNumber: string | null;
  employee: string | null;
  department: string | null;
  date: string | null;
  category: ExpenseCategory;
  amountBeforeVat: number | null;
  vatAmount: number | null;
  vatRate: number | null;
  total: number | null;
  paymentMethod: string | null;
  participants: string[] | null;
  businessPurpose: string | null;
  verdict: Verdict;
  violations: Violation[];
  notes: string;
}

export interface ProcessedReceipt extends ExtractedReceipt {
  id: string;
  fileName: string;
  previewUrl: string;
  status: "pending" | "processing" | "done" | "error";
  errorMessage?: string;
}
