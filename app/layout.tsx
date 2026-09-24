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
  title: "Assaf Mevorach | Technology Innovator & Product Leader",
  description:
    "Assaf Mevorach is Director of Business Strategy & Software Solutions at Intel Client Connectivity. Creator of Thunderbolt Share, CES 2025 Innovation Award Honoree, inventor on two US patents, and contributor to the USB4 specification.",
  openGraph: {
    title: "Assaf Mevorach",
    description:
      "Director of Business Strategy @ Intel. Creator of Thunderbolt Share. Turning deep technology into products people love.",
    type: "website",
    images: ["/photos/headshot.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="grain min-h-full bg-ink font-body text-cream">
        {children}
      </body>
    </html>
  );
}
