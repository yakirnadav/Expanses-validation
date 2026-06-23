import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expense Auditor — ביקורת קבלות הוצאות",
  description: "חילוץ וולידציה אוטומטית של קבלות הוצאות מול מדיניות החברה",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-gray-50 text-gray-900 min-h-screen font-hebrew">{children}</body>
    </html>
  );
}
