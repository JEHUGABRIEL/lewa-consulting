import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Masque l'indicateur DevTools de Next.js en dev : son portail `<nextjs-portal>`
  // ajoutait une bande blanche sous le footer du dashboard admin (et générait des
  // violations CSP style-src). Les erreurs de compilation/runtime restent affichées.
  devIndicators: false,
  turbopack: {
    root: process.cwd(),
  },
  experimental: {



    staleTimes: {
      dynamic: 60,
    },
  },
  images: {



    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
