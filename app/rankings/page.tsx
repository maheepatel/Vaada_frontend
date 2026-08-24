import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { rankStates } from "@/lib/rankings";
import { listCommitments } from "@/lib/repository";

export const metadata: Metadata = { title: "Public promise rankings | Vaada" };

export default async function RankingsPage() {
  const rankings = rankStates(await listCommitments());

  return (
    <main className="site-shell route-shell">
      <SiteHeader />
      <section className="route-hero">
        <p className="eyebrow">PUBLIC ACCOUNTABILITY INDEX</p>
        <h1>State rankings,<br /><span>with receipts.</span></h1>
        <p>A transparent comparison built only from the records currently verified on Vaada.</p>
      </section>
      <section className="route-section">
        <aside className="ranking-method" aria-labelledby="ranking-method-title">
          <p className="eyebrow">HOW THE SCORE WORKS</p>
          <h2 id="ranking-method-title">Kept promises ÷ verified records × 100</h2>
          <p>Only a human verified completion increases a state&apos;s score. Waiting, in progress, late, disputed and unanswered records remain unfinished. Progress is shown for context but does not inflate the rank.</p>
          <p><strong>Ties stay ties.</strong> States with the same completion rate receive the same score and rank. Record volume changes only their display order inside that tied position.</p>
        </aside>
        <ol className="website-ranking-list">
          {rankings.map((item) => <li key={item.state}>
            <strong>{String(item.rank).padStart(2, "0")}</strong>
            <div>
              <Link className="ranking-place-link" href={`/states/${item.stateSlug}`}>
                <h2>{item.state}</h2>
                <small>View all {item.records} state promises →</small>
              </Link>
              <p>{item.records} records · {item.completed} kept · {item.unfinished} unfinished · {item.averageProgress}% average verified progress</p>
              <div className="ranking-district-links" aria-label={`${item.state} districts`}>
                {item.districts.map((district) => <Link href={`/states/${item.stateSlug}?district=${district.slug}`} key={district.slug}><span>{district.name}</span><small>{district.records} {district.records === 1 ? "promise" : "promises"}</small></Link>)}
              </div>
            </div>
            <Link className="ranking-score-link" href={`/states/${item.stateSlug}`} aria-label={`Open ${item.state}, accountability score ${item.score}`}><small>SCORE</small><span>{item.score}</span></Link>
          </li>)}
        </ol>
        <p className="ranking-note">Select a state name, district name or score to open its filtered promise register.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
