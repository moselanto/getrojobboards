import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Community Jobs", template: "%s | Community Jobs" },
  description: "Discover jobs from companies in your community. Search opportunities, explore employers and sign up for job alerts.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}