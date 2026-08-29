import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthGuard } from "@/components/protected-action";
import { PromiseSubmission } from "@/components/promise-submission";

export default async function SubmitPage({ searchParams }: { searchParams: Promise<{ mode?: string; promise?: string }> }) {
  const params = await searchParams;
  if (params.mode === "proof") redirect(`/submit-proof${params.promise ? `?promise=${encodeURIComponent(params.promise)}` : ""}`);
  return <main className="site-shell route-shell"><SiteHeader /><AuthGuard><PromiseSubmission /></AuthGuard><SiteFooter /></main>;
}
