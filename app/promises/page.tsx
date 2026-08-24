import type { Metadata } from "next";
import { PromiseExplorer } from "@/components/promise-explorer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listCommitments } from "@/lib/repository";

export const metadata: Metadata = { title: "Public promise register | Vaada", description: "Browse source backed public commitments by place, sector and verified status." };

export default async function PromisesPage() {
  const commitments = await listCommitments();
  return <main className="site-shell route-shell"><SiteHeader />
    <section className="route-hero"><p className="eyebrow">THE PUBLIC REGISTER · SOURCE BACKED RECORDS</p><h1>Promises you can<br /><span>actually inspect.</span></h1><p>Read the essentials in seconds. Open any record for its source, proof, timeline, responsible office and correction trail.</p></section>
    <section className="route-section"><PromiseExplorer commitments={commitments} /></section><SiteFooter /></main>;
}
