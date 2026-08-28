import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return <main className="auth-route"><Suspense fallback={null}><AuthForm initialMode="login" /></Suspense></main>;
}
