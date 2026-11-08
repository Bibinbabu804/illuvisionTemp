import LegalPage from "@/components/ui/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata({ title: "Privacy notice", description: "How Illuvision handles personal information.", path: "/privacy" }),
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return <LegalPage title="Privacy notice" path="/privacy" />;
}
