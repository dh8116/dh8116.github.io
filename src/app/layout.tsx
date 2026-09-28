import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import SideNav from "@/components/SideNav";
import RouteRepaint from "@/components/RouteRepaint";
import { site } from "@/data/site";
import { alternates } from "@/data/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display face for the 404 glyphs only - self-hosted at build time, so the
// export's font-src 'self' CSP still covers it.
const orbitron = Orbitron({
  variable: "--font-hacker",
  weight: "900",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dh8116.github.io"),
  title: `${site.name} — ${site.tagline}`,
  description: `${site.name}'s personal site: projects and writing.`,
  referrer: "strict-origin-when-cross-origin",
  // "noai"/"noimageai" is the advisory opt-out some crawlers and image scrapers
  // read; robots.txt carries the enforceable half of the same request.
  robots: "index, follow, noai, noimageai",
  alternates: alternates("/", "en"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} h-full antialiased`}
    >
      {/* Microsoft Clarity. Inline on purpose: the export's CSP carries
          'unsafe-inline' for scripts but no nonce, and this has to run before
          the page is interactive to catch the whole session. The clarity.ms
          origins are allowed in scripts/harden-export.mjs — without that the
          tag loads and then silently sends nothing. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            '(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};' +
            't=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;' +
            'y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);' +
            '})(window, document, "clarity", "script", "yo9orgfak3");',
        }}
      />
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <RouteRepaint />
        <BackgroundFX />
        <SideNav />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
