import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthGuard } from "@/components/protected-action";
import { ProofSubmission } from "@/components/proof-submission";

export default async function SubmitProofPage({ searchParams }: { searchParams: Promise<{ promise?: string }> }) {
  const { promise = "" } = await searchParams;
  return <main className="site-shell route-shell"><SiteHeader /><AuthGuard><ProofSubmission initialPromise={promise} /></AuthGuard><SiteFooter /></main>;
}
