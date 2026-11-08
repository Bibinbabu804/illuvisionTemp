import Button from "@/components/ui/Button";
import PageHero from "@/components/ui/PageHero";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <PageHero
      eyebrow="404"
      title="This screen is switched off."
      lead="The page you were looking for doesn't exist or has moved."
    >
      <Button href="/" icon="arrow">Back to home</Button>
      <Button href="/screens" variant="ghost" icon="screen">Explore screens</Button>
    </PageHero>
  );
}
