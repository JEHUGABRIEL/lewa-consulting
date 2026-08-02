import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
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

const BASE_URL = "https://www.lewaconsultingroup.com";

/**
 * Rendu statique : génère les deux locales (/fr, /en) au build,
 * ce qui permet un cache CDN complet (plus de rendu à la demande).
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Aucune locale hors liste n'est rendue à la demande : les pages valides
// sont 100 % statiques (cache CDN), les slugs/locales inconnus → 404.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Metadata");
  const tLegal = await getTranslations("legal");

  // Image de partage (photo de la devanture Cloudinary — recadrée 1200×630, ratio recommandé par les réseaux sociaux).
  const ogImage = {
    url: "https://res.cloudinary.com/dwmrzp61c/image/upload/w_1200,h_630,c_fill,f_auto,q_auto/images/devanture_cabinet/devanture.png",
    width: 1200,
    height: 630,
    alt: tLegal("companyName"),
  };

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: t("title"),
      template: `%s | ${t("suffix")}`,
    },
    description: t("description"),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        fr: `${BASE_URL}/fr`,
        en: `${BASE_URL}/en`,
        "x-default": `${BASE_URL}/fr`,
      },
    },
    openGraph: {
      type: "website",
      url: `${BASE_URL}/${locale}`,
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

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Locale invalide (ex. /zz) → 404 au lieu d'une erreur de traduction.
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);

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
    url: `${BASE_URL}/${locale}`,
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
      {/* Preconnect vers le CDN d'images : démarre la connexion TCP/TLS en
          parallèle du chargement de la page → images visibles plus tôt. */}
      <link rel="preconnect" href="https://res.cloudinary.com" />
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // Échappement pour éviter tout breakout `</script>`.
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <Header />
          {children}
          <Footer />
          <CallButton />
          <ChatBot />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
