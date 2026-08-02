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
  const tLegal = await getTranslations("legal");
  const locale = await getLocale();

  // Image de partage (photo de la devanture Cloudinary — recadrée 1200×630, ratio recommandé par les réseaux sociaux).
  const ogImage = {
    url: "https://res.cloudinary.com/dwmrzp61c/image/upload/w_1200,h_630,c_fill,f_auto,q_auto/images/devanture_cabinet/devanture.png",
    width: 1200,
    height: 630,
    alt: tLegal("companyName"),
  };

  return {
    metadataBase: new URL("https://www.lewaconsultingroup.com"),
    title: {
      default: t("title"),
      template: `%s | ${t("suffix")}`,
    },
    description: t("description"),
    openGraph: {
      type: "website",
      url: "https://www.lewaconsultingroup.com",
      siteName: tLegal("companyName"),
      locale: locale === "fr" ? "fr_FR" : "en_US",
      title: t("title"),
      description: t("description"),
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [ogImage.url],
    },
    verification: {
      google: "-Gq0huJ6mkjUMz9GozQIL5UOW3QpMN9vV9QCDR7rIes",
    },
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
  const tMetadata = await getTranslations("Metadata");
  const tCommon = await getTranslations("common");
  const tLegal = await getTranslations("legal");

  // Balisage Schema.org (JSON-LD) pour enrichir les résultats Google.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "LocalBusiness"],
    name: tLegal("companyName"),
    description: tMetadata("description"),
    url: "https://www.lewaconsultingroup.com",
    logo: "https://res.cloudinary.com/dwmrzp61c/image/upload/images/favicon_lewa.png",
    image: "https://res.cloudinary.com/dwmrzp61c/image/upload/images/favicon_lewa.png",
    telephone: tCommon("phone"),
    email: tCommon("email"),
    address: {
      "@type": "PostalAddress",
      streetAddress: tLegal("companyAddress"),
      addressLocality: "Bangui",
      addressCountry: "CF",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "08:00",
      closes: "18:00",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: tCommon("phone"),
      contactType: "customer service",
      areaServed: "CF",
      availableLanguage: ["fr", "en"],
    },
    sameAs: [
      "https://www.facebook.com/share/p/1HF9MirmNj/",
      "https://www.instagram.com/explore/locations/640425439772028/cabinet-lewa-consulting-group/",
      "https://sn.linkedin.com/in/moctar-lewa-286232217",
    ],
  };

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // Échappement pour éviter tout breakout `</script>`.
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
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
