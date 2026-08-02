import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    // Cache client du router pour les navigations : les pages déjà visitées
    // se rechargent instantanément lors des retours / navigations répétées.
    // (Le rendu est désormais statique par locale : /fr, /en → cache CDN.)
    staleTimes: {
      dynamic: 60,
    },
  },
  images: {
    // Loader custom : génère les URLs Cloudinary (CDN) directement,
    // évitant l'optimiseur serveur /_next/image qui timeout (500)
    // dans certains environnements. Voir lib/image-loader.ts.
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
