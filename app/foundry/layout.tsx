import type { Metadata } from "next";

export const metadata: Metadata = { title: "Foundry", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function FoundryLayout({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 sm:px-8 sm:py-16">{children}</main>;
}
