import Image from "next/image";

/**
 * Logo officiel du Cabinet (favicon_lewa.png).
 * Bannière horizontale à fond transparent — affichée en `object-contain`.
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
      src="https://res.cloudinary.com/dwmrzp61c/image/upload/images/favicon_lewa.png"
      alt="Logo COSI Lewa-Consulting Group"
      width={1144}
      height={491}
      loading={priority ? "eager" : "lazy"}
      className={`${className} object-contain`}
    />
  );
}
