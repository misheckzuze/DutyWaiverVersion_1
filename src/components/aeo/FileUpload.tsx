"use client";
import React, { useState } from "react";

type Props = {
  onChange: (base64: string | null) => void;
  accept?: string;
  label?: string;
  value?: string | null;
};

export default function FileUpload({ onChange, accept = "image/*", label = "Upload", value = null }: Props) {
  const [preview, setPreview] = useState<string | null>(value || null);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      onChange(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="text-sm block mb-1">{label}</label>
      <input type="file" accept={accept} onChange={handle} className="block" />
      {preview && (
        <img src={preview} alt="preview" className="mt-2 max-h-40 rounded" />
      )}
    </div>
  );
}
