"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useState } from "react";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const maxBytes = 10 * 1024 * 1024;

export function EvidenceUpload({ file, onChange, kind }: {
  file: File | null;
  onChange: (file: File | null) => void;
  kind: "promise" | "proof";
}) {
  const inputId = useId();
  const [error, setError] = useState("");
  const previewUrl = useMemo(() => file?.type.startsWith("image/") ? URL.createObjectURL(file) : "", [file]);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const select = (nextFile: File | null) => {
    setError("");
    if (!nextFile) return onChange(null);
    if (!acceptedTypes.has(nextFile.type)) {
      setError("Use a JPEG, PNG, WebP or PDF file.");
      return onChange(null);
    }
    if (nextFile.size > maxBytes) {
      setError("The file must be 10 MB or smaller.");
      return onChange(null);
    }
    onChange(nextFile);
  };

  return <div className="evidence-upload">
    <div className="evidence-upload-heading">
      <div><span>{kind === "proof" ? "PROOF FILE" : "ORIGINAL SOURCE FILE"}</span><strong>{kind === "proof" ? "Add a completion image or signed letter" : "Add the original letter, notice or screenshot"}</strong></div>
      <small>JPEG, PNG, WebP or PDF · max 10 MB</small>
    </div>
    <label className="evidence-file-button" htmlFor={inputId}><span aria-hidden="true">＋</span>{file ? "Replace file" : "Choose file"}</label>
    <input className="evidence-file-input" id={inputId} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => select(event.target.files?.[0] ?? null)} />
    {error && <p className="field-error" role="alert">{error}</p>}
    {file && <div className="evidence-file-preview">
      {previewUrl ? <Image src={previewUrl} alt={`Preview of ${file.name}`} width={900} height={620} unoptimized /> : <div className="pdf-preview" aria-hidden="true"><span>PDF</span></div>}
      <div><strong>{file.name}</strong><span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span><button type="button" onClick={() => select(null)}>Remove</button></div>
    </div>}
  </div>;
}
