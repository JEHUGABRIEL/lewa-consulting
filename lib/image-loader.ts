"use client";

type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};














export default function imageLoader({ src, width }: ImageLoaderProps): string {
  const base = src.split("?")[0];







  if (base.includes("res.cloudinary.com") && base.includes("/image/upload/")) {
    return `${base}?f=auto&q=auto&w=${width}`;
  }


  return `${base}?w=${width}`;
}
