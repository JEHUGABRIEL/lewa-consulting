/** Balisage Schema.org FAQPage (JSON-LD) pour enrichir les résultats Google. */

export type FAQJsonLdItem = {
  q: string;
  r: string;
};

/**
 * Injecte un `<script type="application/ld+json">` de type FAQPage.
 * Le contenu doit correspondre à une FAQ réellement visible sur la page
 * (règle Google) — on passe les mêmes clés i18n que la section FAQ rendue.
 */
export default function FAQJsonLd({ items }: { items: FAQJsonLdItem[] }) {
  if (items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.r,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        // Échappement pour éviter tout breakout `</script>`.
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
