import { HomeExperience } from "@/components/home-experience";
import { listCommitments } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function Home() {
  return <HomeExperience commitments={await listCommitments()} />;
}
