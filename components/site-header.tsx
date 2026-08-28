"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VaadaLogo } from "./vaada-logo";
import { BackButton } from "./back-button";
import { LiveVisitors } from "./live-visitors";
import { ProtectedActionLink } from "./protected-action";
import { useAuth } from "./auth-provider";

const links = [
  { href: "/", label: "Home", icon: "⌂", exact: true },
  { href: "/promises", label: "Promises", icon: "◫" },
  { href: "/rankings", label: "Rankings", icon: "⌁" },
  { href: "/completed", label: "Completed", icon: "✓" },
  { href: "/submit", label: "Record", icon: "+" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { loading, signedIn } = useAuth();
  const active = (href: string, exact?: boolean) => exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`) || (href === "/promises" && pathname.startsWith("/states/"));
  return (
    <>
    <div className="site-top-actions">
      <div className="site-top-left">
        <div className="site-brand-row"><VaadaLogo className="site-corner-logo" tagline tone="light" /><LiveVisitors /></div>
        {pathname !== "/" && <BackButton className="route-back-control" />}
      </div>
      {pathname !== "/login" && <div className="site-top-right">{signedIn
        ? <Link className="site-app-launch" href="/account"><span aria-hidden="true">●</span> Account</Link>
        : <Link className="site-app-launch" href="/login"><span aria-hidden="true">○</span> {loading ? "Checking…" : "Log in"}</Link>}
      </div>}
    </div>
    <header className="floating-dock site-dock">
      <nav className="dock-links" aria-label="Primary navigation">
        {links.map((link) => link.href === "/submit"
          ? <ProtectedActionLink key={link.href} href={link.href} className={active(link.href) ? "active" : ""}><span className="dock-icon" aria-hidden="true">{link.icon}</span><span>{link.label}</span></ProtectedActionLink>
          : <Link key={link.href} href={link.href} className={active(link.href, link.exact) ? "active" : ""} aria-current={active(link.href, link.exact) ? "page" : undefined}><span className="dock-icon" aria-hidden="true">{link.icon}</span><span>{link.label}</span></Link>)}
      </nav>
    </header>
    </>
  );
}
