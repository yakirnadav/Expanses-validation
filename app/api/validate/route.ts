import { NextRequest, NextResponse } from "next/server";
import { MODEL, SYSTEM_PROMPT, buildContentBlock, getAnthropicClient } from "@/lib/anthropic";
import type { ExtractedReceipt } from "@/lib/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_MEDIA_TYPES = new Set(["image/png", "image/jpeg", "application/pdf"]);

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("לא נמצא JSON בתשובת המודל");
  }
  return JSON.parse(trimmed.slice(start, end + 1));
}

function normalizeReceipt(raw: any): ExtractedReceipt {
  const validCategories = [
    "meals",
    "lodging",
    "taxi",
    "office_supplies",
    "training",
    "client_gifts",
    "other",
    "unknown",
  ];
  const validVerdicts = ["compliant", "exceeds", "needs_review"];

  const category = validCategories.includes(raw?.category) ? raw.category : "unknown";
  let verdict = validVerdicts.includes(raw?.verdict) ? raw.verdict : "needs_review";

  // כלל ברזל: בקטגוריה לא מזוהה או ללא נתונים מינימליים, אין אישור עיוור
  if (category === "unknown" || raw?.total == null) {
    verdict = verdict === "compliant" ? "needs_review" : verdict;
  }

  return {
    vendor: raw?.vendor ?? null,
    businessNumber: raw?.businessNumber ?? null,
    invoiceNumber: raw?.invoiceNumber ?? null,
    employee: raw?.employee ?? null,
    department: raw?.department ?? null,
    date: raw?.date ?? null,
    category,
    amountBeforeVat: typeof raw?.amountBeforeVat === "number" ? raw.amountBeforeVat : null,
    vatAmount: typeof raw?.vatAmount === "number" ? raw.vatAmount : null,
    vatRate: typeof raw?.vatRate === "number" ? raw.vatRate : null,
    total: typeof raw?.total === "number" ? raw.total : null,
    paymentMethod: raw?.paymentMethod ?? null,
    participants: Array.isArray(raw?.participants) ? raw.participants : null,
    businessPurpose: raw?.businessPurpose ?? null,
    verdict,
    violations: Array.isArray(raw?.violations)
      ? raw.violations.map((v: any) => ({
          rule: String(v?.rule ?? "כלל לא ידוע"),
          detail: String(v?.detail ?? ""),
          severity: ["high", "medium", "low"].includes(v?.severity) ? v.severity : "medium",
        }))
      : [],
    notes: typeof raw?.notes === "string" ? raw.notes : "",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { base64Data, mediaType } = body as { base64Data?: string; mediaType?: string };

    if (!base64Data || !mediaType) {
      return NextResponse.json({ error: "חסרים נתוני קובץ" }, { status: 400 });
    }
    if (!ALLOWED_MEDIA_TYPES.has(mediaType)) {
      return NextResponse.json({ error: "סוג קובץ לא נתמך" }, { status: 400 });
    }

    const client = getAnthropicClient();
    const contentBlock = buildContentBlock(base64Data, mediaType);

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            contentBlock as any,
            {
              type: "text",
              text: "חלץ את נתוני הקבלה ובצע ולידציה מול המדיניות. החזר JSON בלבד לפי הסכמה שהוגדרה.",
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("לא התקבלה תשובת טקסט מהמודל");
    }

    const raw = extractJson(textBlock.text);
    const receipt = normalizeReceipt(raw);

    return NextResponse.json(receipt);
  } catch (error: any) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: error?.message ?? "שגיאה בעיבוד הקבלה" },
      { status: 500 }
    );
  }
}
