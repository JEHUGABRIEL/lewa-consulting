import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "../globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Administration — COSI LEWA Consulting",
  robots: { index: false, follow: false },
};





export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
