"use client";

type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

/**
 * Loader d'images custom pour next/image.
 *
 * Génère directement les URLs du CDN Unsplash (`?w=&q=`), ce qui contourne
 * l'optimiseur serveur `/_next/image` — qui timeout (500) dans certains
 * environnements. Unsplash supporte nativement `w` et `q` en paramètres.
 *
 * Configuré dans next.config.ts via `images.loader` + `images.loaderFile`.
 */
export default function unsplashLoader({ src, width, quality }: ImageLoaderProps): string {
  const base = src.split("?")[0];

  // Images du CDN Unsplash : reconstruction des paramètres (w/q natifs)
  if (base.includes("images.unsplash.com")) {
    return `${base}?w=${width}&q=${quality || 75}`;
  }

  // Chemins locaux (public/) : on propage le paramètre width pour satisfaire
  // le contrôle de next/image (un loader doit implémenter width). Le serveur
  // de fichiers statiques ignore la query string et sert le fichier tel quel.
  return `${base}?w=${width}`;
}
