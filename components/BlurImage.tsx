"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type BlurImageProps = {
  src: string;
  alt: string;
  placeholderSrc?: string;
  className?: string;
  width?: number;
  height?: number;

  eager?: boolean;
};











function makeCloudinaryBlurUrl(src: string): string | null {
  if (!src.includes("res.cloudinary.com") || !src.includes("/image/upload/")) {
    return null;
  }
  const base = src.split("?")[0];
  return `${base}?w=20&q=20&e=blur:1000`;
}

export default function BlurImage({
  src,
  alt,
  placeholderSrc,
  className = "",
  width,
  height,
  eager = false,
}: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(eager);
  const imgRef = useRef<HTMLDivElement>(null);
  const blurUrl = placeholderSrc ?? makeCloudinaryBlurUrl(src);


  useEffect(() => {
    if (eager) return;

    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: "200px" },  
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      { }
      {blurUrl && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
            loaded ? "opacity-0" : "opacity-100"
          }`}
          style={{
            backgroundImage: `url("${blurUrl}")`,
            filter: "blur(20px)",
            transform: "scale(1.1)",
          }}
          aria-hidden="true"
        />
      )}

      { }
      {inView && (
        <Image
          src={src.split("?")[0]}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          className={`object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
