import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return <main className="auth-route"><Suspense fallback={null}><AuthForm initialMode="signup" /></Suspense></main>;
}
