import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import SideNav from "@/components/SideNav";
import RouteRepaint from "@/components/RouteRepaint";
import { site } from "@/data/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: `${site.name}'s personal site: projects and writing.`,
  referrer: "strict-origin-when-cross-origin",
  // "noai"/"noimageai" is the advisory opt-out some crawlers and image scrapers
  // read; robots.txt carries the enforceable half of the same request.
  robots: "index, follow, noai, noimageai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
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
