import Reveal from "./Reveal";

export type FAQItem = {
  q: string;
  r: string;
};

export default function FAQSection({
  title,
  items,
  image,
  imageAlt,
}: {
  title: string;
  items: FAQItem[];
  /** Image d'illustration optionnelle (Unsplash) */
  image?: string;
  imageAlt?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="text-center">
        {image && (
          <div className="relative mx-auto mb-6 h-24 w-36 overflow-hidden rounded-xl">
            <img
              src={image.replace("w=600&q=80", "w=300&h=200&fit=crop&q=60")}
              alt={imageAlt ?? ""}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>
        )}
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          <span className="inline-block h-px w-4 bg-gold/50" />
          Vous avez des questions ?
          <span className="inline-block h-px w-4 bg-gold/50" />
        </span>
        <h2 className="mt-4 font-display text-2xl text-navy">{title}</h2>
      </div>

      <div className="mt-8 divide-y divide-border border-t border-border">
        {items.map((item, i) => (
          <Reveal as="div" key={item.q} delay={i * 80}>
            <details className="group py-4">
              <summary className="flex items-center justify-between gap-4 text-sm font-semibold text-navy list-none cursor-pointer transition-colors duration-200 hover:text-red">
                <span>{item.q}</span>
                <svg
                  className="h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-open:rotate-45"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </summary>
              <div className="mt-3 text-sm leading-relaxed text-ink/70 max-w-2xl">
                {item.r}
              </div>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
