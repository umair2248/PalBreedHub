import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { SITE_NAME, SITE_URL } from "@/components/site-links";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: "/logo.webp", width: 439, height: 120, alt: SITE_NAME }],
  },
  title: {
    default: "Palworld Breeding Calculator | PalBreedHub",
    template: "%s | PalBreedHub",
  },
  description: "Find the right parent Pals to breed any Pal in Palworld.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#070b16" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
