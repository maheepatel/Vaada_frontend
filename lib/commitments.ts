export type Commitment = {
  id: string;
  state: string;
  district: string;
  sector: string;
  status: string;
  tone: "progress" | "late" | "done";
  title: string;
  authority: string;
  promised: string;
  deadline: string;
  progress: number;
  evidence: string;
  update: string;
  impact: string;
  source: string;
  summary: string;
  sources: Array<{ title: string; publisher: string; date: string; type: string }>;
};

export const commitments: Commitment[] = [
  {
    id: "01", state: "Rajasthan", district: "Jaipur", sector: "Education", status: "IN PROGRESS", tone: "progress",
    title: "Upgrade 50 government schools with digital classrooms",
    authority: "Department of School Education", promised: "14 Feb 2025", deadline: "31 Mar 2027",
    progress: 64, evidence: "3 verified sources", update: "Last evidence reviewed 8 days ago",
    impact: "50 schools · approximately 18,400 students", source: "Government order + 2 media reports",
    summary: "The state announced a phased upgrade of 50 government schools with connected classrooms, teacher training and digital learning equipment. Progress shown here reflects only evidence accepted by a human reviewer.",
    sources: [
      { title: "Digital classroom implementation order", publisher: "Department of School Education", date: "14 Feb 2025", type: "Signed order" },
      { title: "First-phase equipment tender awarded", publisher: "Rajasthan procurement portal", date: "18 Dec 2025", type: "Official record" },
      { title: "Thirty-two schools photographed after installation", publisher: "Independent field verification", date: "15 Aug 2026", type: "Field evidence" },
    ],
  },
  {
    id: "02", state: "Uttar Pradesh", district: "Varanasi", sector: "Water", status: "LATE", tone: "late",
    title: "Complete piped drinking water coverage across 18 villages",
    authority: "District Water & Sanitation Mission", promised: "09 Aug 2024", deadline: "30 Jun 2026",
    progress: 38, evidence: "5 verified sources", update: "Deadline passed 54 days ago",
    impact: "18 villages · approximately 32,000 residents", source: "Official announcement + 4 field updates",
    summary: "The district mission committed to household tap coverage in 18 villages. The stated deadline has passed; the record does not infer intent and reports only verified physical progress.",
    sources: [
      { title: "Village coverage announcement", publisher: "District Water & Sanitation Mission", date: "09 Aug 2024", type: "Official announcement" },
      { title: "Pipeline work progress register", publisher: "District engineering office", date: "22 May 2026", type: "Official record" },
    ],
  },
  {
    id: "03", state: "Maharashtra", district: "Nashik", sector: "Health", status: "FULFILLED", tone: "done",
    title: "Open a 100-bed public hospital wing for maternal care",
    authority: "Public Health Department", promised: "21 Nov 2023", deadline: "15 Jul 2026",
    progress: 100, evidence: "7 verified sources", update: "Completion verified 22 Jul 2026",
    impact: "100 beds · maternal and newborn care", source: "Signed order + inspection media",
    summary: "The promised maternal-care wing was opened and independently verified after the stated deadline. Fulfilment is supported by an operational inspection and public service records.",
    sources: [
      { title: "Maternal wing sanction order", publisher: "Public Health Department", date: "21 Nov 2023", type: "Signed order" },
      { title: "Operational readiness inspection", publisher: "District health inspection team", date: "22 Jul 2026", type: "Inspection" },
    ],
  },
];

export function getCommitment(id: string) {
  return commitments.find((item) => item.id === id);
}
