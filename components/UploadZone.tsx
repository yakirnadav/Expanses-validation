"use client";

import { useCallback, useRef, useState } from "react";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "application/pdf"];

export default function UploadZone({ onFilesSelected, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const files = Array.from(fileList).filter((f) => ACCEPTED_TYPES.includes(f.type));
      if (files.length > 0) onFilesSelected(files);
    },
    [onFilesSelected]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
        isDragging ? "border-brand bg-brand-light" : "border-gray-300 bg-white"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-brand"}`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-lg font-semibold text-gray-700 mb-1">
        גרור קבלות לכאן או לחץ לבחירת קבצים
      </p>
      <p className="text-sm text-gray-500">תמיכה ב-PNG, JPEG ו-PDF — ניתן להעלות מספר קבלות בבת אחת</p>
    </div>
  );
}
