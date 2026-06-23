import Anthropic from "@anthropic-ai/sdk";
import { POLICY_TEXT } from "./policy";

// שינוי המודל מתבצע כאן בלבד
export const MODEL = "claude-sonnet-4-6";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export const SYSTEM_PROMPT = `אתה רואה חשבון פנימי שמבצע ביקורת קבלות הוצאות לחברה. עליך לחלץ נתונים מתוך קבלה (תמונה או PDF) ולקבוע האם ההוצאה תואמת את מדיניות ההוצאות של החברה.

מדיניות ההוצאות המלאה:
${POLICY_TEXT}

הוראות עבודה:
- חלץ כל שדה במדויק מהקבלה. אם שדה חסר או לא קריא — החזר null. אל תמציא ערכים בשום מקרה.
- זהה את הקטגוריה מתוך: meals, lodging, taxi, office_supplies, training, client_gifts, other, unknown.
- הפעל את כל חוקי המדיניות (תקרות לאירוע, תיעוד חובה, איסורים) וקבע verdict: compliant / exceeds / needs_review.
- כל הפרה שמצאת מתועדת באובייקט violations עם rule (שם הכלל), detail (נימוק ספציפי בעברית) ו-severity (high/medium/low).
- כלל ברזל: אם יש חיסור בנתונים, ספק, או שאינך בטוח בוודאות גבוהה שההוצאה תואמת למדיניות — verdict חייב להיות "needs_review". לעולם אל תחזיר "compliant" כשיש ספק.
- אם הקטגוריה לא ברורה (unknown) — verdict = "needs_review".
- בדוק התאמת שיעור מע"מ לתאריך: בישראל שיעור המע"מ היה 17% עד 31.12.2024 ו-18% מ-1.1.2025 ואילך. אם vatRate בקבלה לא תואם לשיעור הצפוי לפי התאריך, הוסף violation עם rule="התאמת מע\"מ לתאריך", severity="medium".
- בדוק אם התאריך חל בסוף שבוע (יום שישי אחרי הצהריים או שבת). אם כן ואין businessPurpose ספציפי וברור בקבלה — verdict = "needs_review" עם violation מתאים.
- החזר אך ורק JSON תקין שמתאים בדיוק לסכמה הבאה, בלי טקסט עוטף, בלי הסברים, בלי Markdown, בלי גרשיים שלוש:

{
  "vendor": "string | null",
  "businessNumber": "string | null",
  "invoiceNumber": "string | null",
  "employee": "string | null",
  "department": "string | null",
  "date": "YYYY-MM-DD | null",
  "category": "meals | lodging | taxi | office_supplies | training | client_gifts | other | unknown",
  "amountBeforeVat": "number | null",
  "vatAmount": "number | null",
  "vatRate": "number | null",
  "total": "number | null",
  "paymentMethod": "string | null",
  "participants": "string[] | null",
  "businessPurpose": "string | null",
  "verdict": "compliant | exceeds | needs_review",
  "violations": [
    { "rule": "string", "detail": "string", "severity": "high | medium | low" }
  ],
  "notes": "string"
}`;

export function buildContentBlock(base64Data: string, mediaType: string) {
  if (mediaType === "application/pdf") {
    return {
      type: "document" as const,
      source: {
        type: "base64" as const,
        media_type: "application/pdf" as const,
        data: base64Data,
      },
    };
  }
  return {
    type: "image" as const,
    source: {
      type: "base64" as const,
      media_type: mediaType as "image/png" | "image/jpeg",
      data: base64Data,
    },
  };
}
