import LegalPage from "@/components/ui/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata({ title: "Terms of use", description: "Terms of use for the Illuvision website.", path: "/terms" }),
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return <LegalPage title="Terms of use" path="/terms" />;
}
