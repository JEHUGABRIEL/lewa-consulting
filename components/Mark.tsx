import Image from "next/image";

/**
 * Logo officiel du Cabinet (logo_lewa.png).
 * Bannière horizontale sur fond blanc — affichée en `object-contain`.
 */
export default function Mark({
  className = "h-10 w-auto",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/images/logo_lewa.png"
      alt="Logo COSI Lewa-Consulting Group"
      width={1241}
      height={848}
      loading={priority ? "eager" : "lazy"}
      className={`${className} object-contain`}
    />
  );
}
