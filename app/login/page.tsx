import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function LoginPage() {
  return <main className="site-shell route-shell auth-route"><SiteHeader /><Suspense fallback={null}><AuthForm initialMode="login" /></Suspense><SiteFooter /></main>;
}
