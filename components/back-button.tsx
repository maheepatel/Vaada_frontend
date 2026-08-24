"use client";

import { useRouter } from "next/navigation";

export function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  return <button className={`back-control ${className}`.trim()} type="button" onClick={() => { if (window.history.length > 1) router.back(); else router.push("/"); }} aria-label="Go back"><span aria-hidden="true">←</span> Back</button>;
}
