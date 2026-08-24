import { PromiseExplorer } from "@/components/promise-explorer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listCommitments } from "@/lib/repository";

export default async function StatePage({ params, searchParams }: { params: Promise<{ state: string }>; searchParams: Promise<{ district?: string }> }) { const { state } = await params; const { district } = await searchParams; const all = await listCommitments(); const stateRecords = all.filter((item) => item.stateSlug === state); const records = district ? stateRecords.filter((item) => item.districtSlug === district) : stateRecords; const stateName = stateRecords[0]?.state ?? state.split("-").map((x)=>x[0].toUpperCase()+x.slice(1)).join(" "); const districtName = district ? (stateRecords.find((item)=>item.districtSlug===district)?.district ?? district) : null; const name = districtName ? `${districtName}, ${stateName}` : stateName;
  return <main className="site-shell route-shell"><SiteHeader /><section className="route-hero paper-hero"><p className="eyebrow">BROWSE BY PLACE</p><h1>{name}</h1><p>{records.length} source backed public {records.length === 1 ? "promise" : "promises"} currently in the register.</p></section><section className="route-section"><PromiseExplorer commitments={records} compact /></section><SiteFooter /></main>;
}
