import ProposalView from "@/components/advertise/ProposalView";

export const metadata = {
  title: "Campaign Proposal — Illuvision",
  description: "Review your personalized Illuvision digital screen advertising campaign proposal.",
  robots: { index: false, follow: false },
};

export default async function ProposalPage({ params }) {
  const { token } = await params;
  return <ProposalView token={token} />;
}
