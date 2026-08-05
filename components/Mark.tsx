import Image from "next/image";





export default function Mark({
  className = "h-10 w-auto",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo_sans_background.png"
      alt="Logo COSI Lewa-Consulting Group"
      width={1144}
      height={491}
      loading={priority ? "eager" : "lazy"}
      className={`${className} object-contain`}
    />
  );
}
