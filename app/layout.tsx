import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import CallButton from "@/components/CallButton";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    title: {
      default: t("title"),
      template: `%s | ${t("suffix")}`,
    },
    description: t("description"),
    icons: {
      icon: [
        { url: "https://res.cloudinary.com/dwmrzp61c/image/upload/images/favicon_lewa-512.png", sizes: "512x512", type: "image/png" },
        { url: "https://res.cloudinary.com/dwmrzp61c/image/upload/images/favicon_lewa-64.png", sizes: "64x64", type: "image/png" },
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <NextIntlClientProvider messages={messages}>
          <Header initialLocale={locale} />
          {children}
          <Footer />
          <CallButton />
          <ChatBot />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
