import type { Metadata } from "next";
import { DM_Mono, Instrument_Sans, Schibsted_Grotesk } from "next/font/google";

import "./globals.css";

const display = Schibsted_Grotesk({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-schibsted",
});

const body = Instrument_Sans({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-instrument",
});

const mono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "AI customer support for your website",
  description: "Train an agent on your pages and files, answer customers, and keep the leads.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
