"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth, type AppRole } from "./auth-provider";

const loginHref = (next: string) => `/login?next=${encodeURIComponent(next)}`;

export function ProtectedActionLink({ href, children, className, hideWhenSignedOut = false, roles }: {
  href: string;
  children: ReactNode;
  className?: string;
  hideWhenSignedOut?: boolean;
  roles?: AppRole[];
}) {
  const router = useRouter();
  const { configured, loading, signedIn, role } = useAuth();
  const allowed = !roles || Boolean(role && roles.includes(role));
  if (hideWhenSignedOut && (!signedIn || !allowed)) return null;

  const protect = (event: MouseEvent<HTMLAnchorElement>) => {
    if (loading) {
      event.preventDefault();
      return toast.message("Checking your account…");
    }
    if (!configured) {
      event.preventDefault();
      return toast.error("Login is not connected yet. Add the Supabase environment variables first.");
    }
    if (!signedIn) {
      event.preventDefault();
      toast.info("Please log in or create an account to continue.");
      router.push(loginHref(href));
      return;
    }
    if (!allowed) {
      event.preventDefault();
      toast.error("This action requires an approved reviewer account.");
    }
  };

  return <Link href={href} className={className} onClick={protect}>{children}</Link>;
}

export function AuthGuard({ children, roles }: { children: ReactNode; roles?: AppRole[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const notified = useRef(false);
  const { configured, loading, signedIn, role } = useAuth();
  const allowed = !roles || Boolean(role && roles.includes(role));

  useEffect(() => {
    if (loading || notified.current) return;
    if (!configured || !signedIn) {
      notified.current = true;
      toast.info("Please log in or create an account to access this page.");
      const current = typeof window === "undefined" ? pathname : `${window.location.pathname}${window.location.search}`;
      router.replace(loginHref(current));
    } else if (!allowed) {
      notified.current = true;
      toast.error("This page is restricted to approved reviewers.");
      router.replace("/account");
    }
  }, [allowed, configured, loading, pathname, router, signedIn]);

  if (loading) return <div className="auth-gate-state" role="status">Checking your secure Vaada account…</div>;
  if (!configured || !signedIn || !allowed) return <div className="auth-gate-state" role="status">Redirecting to secure login…</div>;
  return <>{children}</>;
}
