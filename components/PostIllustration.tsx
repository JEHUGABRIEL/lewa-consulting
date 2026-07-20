const illustrations: Record<
  string,
  { gradient: string; icon: string; bgFrom: string; bgTo: string }
> = {
  Formations: {
    gradient: "from-gold/20 to-gold/5",
    bgFrom: "from-gold",
    bgTo: "to-gold-bright",
    icon: "academic",
  },
  "Audit & Comptabilité": {
    gradient: "from-navy/15 to-navy/5",
    bgFrom: "from-navy",
    bgTo: "to-navy-deep",
    icon: "chart",
  },
  Événement: {
    gradient: "from-red/15 to-red/5",
    bgFrom: "from-red",
    bgTo: "to-red",
    icon: "event",
  },
};

const defaultIll = illustrations["Formations"];

export default function PostIllustration({
  category,
  src,
  alt,
}: {
  category: string;
  /** URL d'une image réelle (Unsplash) pour remplacer l'illustration SVG */
  src?: string;
  alt?: string;
}) {
  // Si une vraie image est fournie, l'afficher directement
  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? category}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
    );
  }

  // Fallback : illustration SVG décorative par catégorie
  const ill = illustrations[category] ?? defaultIll;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${ill.gradient}`}
    >
      {/* Motif décoratif */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.06]"
        viewBox="0 0 200 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="30" cy="30" r="40" fill="currentColor" />
        <circle cx="170" cy="90" r="50" fill="currentColor" />
        <rect x="100" y="10" width="60" height="60" rx="8" fill="currentColor" />
        <circle cx="60" cy="90" r="20" fill="currentColor" />
      </svg>

      {/* Icône principale */}
      <span
        className={`relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${ill.bgFrom} ${ill.bgTo} text-paper shadow-sm`}
      >
        {ill.icon === "academic" && (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        )}
        {ill.icon === "chart" && (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        )}
        {ill.icon === "event" && (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <circle cx="12" cy="14" r="1" />
            <circle cx="12" cy="18" r="1" />
          </svg>
        )}
      </span>
    </div>
  );
}
