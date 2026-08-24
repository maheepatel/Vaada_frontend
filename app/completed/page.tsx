import type { Metadata } from "next";
import { PromiseExplorer } from "@/components/promise-explorer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listCommitments } from "@/lib/repository";

export const metadata: Metadata = { title: "Completed public promises | Vaada", description: "Promises marked complete only after accepted public proof and human review." };

export default async function CompletedPromisesPage() {
  const commitments = (await listCommitments()).filter((item) => item.status === "fulfilled");
  return <main className="site-shell route-shell"><SiteHeader />
    <section className="route-hero completed-hero"><p className="eyebrow">PROMISES KEPT · PROOF ATTACHED</p><h1>Completed means<br /><span>verified.</span></h1><p>Every record here has reached 100% after a reviewer accepted completion evidence. Open a card to inspect the proof and public history.</p></section>
    <section className="route-section"><PromiseExplorer commitments={commitments} compact /></section><SiteFooter /></main>;
}
