# Expense Auditor

יישום Web לחילוץ אוטומטי ולולידציה של קבלות הוצאות מול מדיניות החברה, באמצעות Claude.

## הרצה

```bash
git clone https://github.com/yakirnadav/Expanses-validation.git
cd Expanses-validation
git checkout claude/elegant-fermi-049e6g
npm install
cp .env.local.example .env.local
# הוסף את מפתח ה-API שלך לקובץ .env.local:
# ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

האפליקציה תרוץ בכתובת http://localhost:3000

## מבנה הפרויקט

- `app/page.tsx` — עמוד ראשי, ניהול ה-state של הקבלות
- `app/api/validate/route.ts` — קריאה ל-Claude לחילוץ וולידציה (server-side בלבד)
- `lib/policy.ts` — מדיניות ההוצאות
- `lib/anthropic.ts` — קליינט Anthropic, קבוע `MODEL`, system prompt
- `lib/smartChecks.ts` — בדיקות צבירה חודשית וכפילויות בין קבלות
- `lib/csvExport.ts` — ייצוא תוצאות ל-CSV בעברית
- `components/` — קומפוננטות UI

## שינוי מודל

לשינוי המודל בו משתמש האפליקציה, ערוך את הקבוע `MODEL` בקובץ `lib/anthropic.ts`.
