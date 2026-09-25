import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://assaf-mevorach.vercel.app"),
  title:
    "Assaf Mevorach | Director of Product Management & Business Strategy, Intel | Thunderbolt, Semiconductors",
  description:
    "Assaf Mevorach is Director of Business Strategy & Software Solutions at Intel Client Connectivity: 26 years in product management, software engineering leadership, and semiconductors. Creator of Thunderbolt Share (CES 2025 Innovation Award Honoree), named inventor on two US patents, and contributor to the USB4 specification.",
  keywords: [
    "Assaf Mevorach",
    "Intel",
    "Product Management",
    "Business Strategy",
    "Director",
    "Thunderbolt",
    "Thunderbolt Share",
    "USB4",
    "Wi-Fi",
    "Semiconductors",
    "Software Engineering Leadership",
    "Connectivity",
  ],
  openGraph: {
    title: "Assaf Mevorach | Director of Product Management & Business Strategy, Intel",
    description:
      "26 years at Intel. Creator of Thunderbolt Share (CES 2025 Innovation Award Honoree). Turning deep technology into products people love.",
    type: "website",
    images: ["/photos/headshot.jpg"],
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Assaf Mevorach",
  jobTitle: "Director of Business Strategy & Software Solutions",
  worksFor: {
    "@type": "Organization",
    name: "Intel Corporation",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Portland",
    addressRegion: "OR",
    addressCountry: "US",
  },
  url: "https://assaf-mevorach.vercel.app",
  sameAs: [
    "https://www.linkedin.com/in/assafm",
    "https://github.com/assafmevorach",
  ],
  knowsAbout: [
    "Product Management",
    "Business Strategy",
    "Thunderbolt",
    "USB4",
    "Wi-Fi",
    "Semiconductors",
    "Software Engineering Leadership",
    "Connectivity",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="grain min-h-full bg-ink font-body text-cream">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
