"use client";

type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

/**
 * Loader d'images custom pour next/image.
 *
 * Génère les URLs finales selon la source :
 *  - Cloudinary (res.cloudinary.com) : insère les transformations
 *    `f_auto,q_auto,w_<width>` après `/image/upload/` → format auto,
 *    compression auto et redimensionnement côté CDN.
 *  - Chemins locaux (public/) : propagation du paramètre width pour
 *    satisfaire le contrôle de next/image (le serveur statique ignore
 *    la query string et sert le fichier tel quel).
 *
 * Configuré dans next.config.ts via `images.loader` + `images.loaderFile`.
 */
export default function imageLoader({ src, width }: ImageLoaderProps): string {
  const base = src.split("?")[0];

  // Cloudinary : transformations en query params (?f=auto&q=auto&w=<width>).
  // NB : la forme « chemin » (…/f_auto,q_auto,w_<n>/<public_id>) renvoie un
  // HTTP 400 quand le dossier du public_id ressemble à un paramètre de
  // transformation (ex. « qui_sommes_nous/ » → « Invalid transformation
  // parameter - qui »). La forme query params est robuste pour tous les
  // public_id, dossiers ou non.
  if (base.includes("res.cloudinary.com") && base.includes("/image/upload/")) {
    return `${base}?f=auto&q=auto&w=${width}`;
  }

  // Chemins locaux (public/)
  return `${base}?w=${width}`;
}
