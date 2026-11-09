// Global design system first, so component CSS modules can override it.
import "./globals.css";
import { Urbanist } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LogoIntro from "@/components/layout/LogoIntro";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Cursor from "@/components/motion/Cursor";
import ScrollProgress from "@/components/motion/ScrollProgress";
import { site } from "@/data/site";
import { JsonLd, organizationSchema } from "@/lib/seo";
import logo from "@/assets/images/logo.png";

const urbanist = Urbanist({ subsets: ["latin"], variable: "--font-urbanist", display: "swap" });

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Illuvision — Commercial digital screens & screen advertising",
    template: "%s | Illuvision",
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "Illuvision — Commercial digital screens & screen advertising",
    description: site.description,
    url: "/",
    images: [{ url: logo.src, width: logo.width, height: logo.height, alt: "Illuvision logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Illuvision — Commercial digital screens",
    description: site.description,
    images: [logo.src],
  },
  icons: { icon: logo.src },
};

export const viewport = {
  themeColor: "#f3f4f0",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before paint: enables JS-only reveal styles and skips the loader
// for reduced-motion users. The loader plays on every full page load; once
// it has lifted, `intro-done` is set so in-app navigations don't wait.
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('intro-done')}else{setTimeout(function(){d.classList.add('intro-done')},5000)}}catch(e){d.classList.add('intro-done')}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={urbanist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <div id="top-sentinel" aria-hidden="true" style={{ position: "absolute", top: 0, height: 24, width: 1 }} />
        <LogoIntro />
        <SmoothScroll />
        <Cursor />
        <ScrollProgress />
        <div className="gridlines" aria-hidden="true"><span /><span /><span /><span /><span /></div>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <JsonLd data={organizationSchema(logo.src)} />
      </body>
    </html>
  );
}
