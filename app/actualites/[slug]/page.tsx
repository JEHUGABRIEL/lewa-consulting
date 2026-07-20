import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import PostIllustration from "@/components/PostIllustration";
import HeroSlider from "@/components/HeroSlider";
import Mark from "@/components/Mark";
import { posts } from "@/lib/posts";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) {
    const t = await getTranslations();
    return { title: t('blog.notFound') };
  }
  return { title: post.title };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  // Index dans la liste complète pour la navigation précédent/suivant
  const currentIndex = posts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  // Découper le contenu ligne par ligne
  const lines = post.content.split("\n");

  // Articles similaires (même catégorie, sauf celui-ci)
  // Fallback : articles récents si aucun dans la même catégorie
  const sameCategory = posts.filter(
    (p) => p.slug !== post.slug && p.category === post.category,
  );
  const suggested = sameCategory.length > 0
    ? sameCategory
    : posts.filter((p) => p.slug !== post.slug).slice(0, 4);
  const heroBgs = getHeroBackgrounds("formations");
  const t = await getTranslations();

  return (
    <main>
      {/* Hero avec slider */}
      <section className="relative overflow-hidden border-b border-navy-deep">
        {/* Top accent bar */}
        <div className="relative z-20 h-[3px] w-full bg-gradient-to-r from-gold-bright via-red to-navy" />

        <HeroSlider slides={heroBgs} interval={5000} />

        {/* Décor géométrique */}
        <div className="pointer-events-none absolute -right-20 -top-16 z-10 select-none text-white/[0.06]" aria-hidden="true">
          <Mark className="h-48 w-48" />
        </div>

        <Container className="relative z-10 py-24 sm:py-[7.5rem]">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80">
                {post.category}
              </span>
              <span className="text-xs text-white/50">{post.date}</span>
            </div>

            <h1 className="mt-4 font-display text-3xl leading-tight text-white sm:text-4xl">
              {post.title}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
              {post.excerpt}
            </p>
          </div>
        </Container>
      </section>

      {/* Contenu de l'article */}
      <Container className="py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* Colonne principale */}
          <div>
            {/* Article body */}
            <article className="max-w-none">
              {(() => {
                // Parser ligne par ligne : regroupe les lignes en blocs
                const blocks: { type: "p" | "list"; items: string[] }[] = [];
                let current: { type: "p" | "list"; items: string[] } | null = null;

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed) {
                    // Ligne vide -> ferme le bloc courant
                    if (current) {
                      blocks.push(current);
                      current = null;
                    }
                    continue;
                  }

                  const isListItem = trimmed.startsWith("- ");

                  if (isListItem) {
                    if (current?.type === "list") {
                      current.items.push(trimmed.replace(/^- /, ""));
                    } else {
                      if (current) blocks.push(current);
                      current = { type: "list", items: [trimmed.replace(/^- /, "")] };
                    }
                  } else {
                    if (current?.type === "p") {
                      current.items.push(trimmed);
                    } else {
                      if (current) blocks.push(current);
                      current = { type: "p", items: [trimmed] };
                    }
                  }
                }
                if (current) blocks.push(current);

                return blocks.map((block, i) => {
                  if (block.type === "list") {
                    return (
                      <ul key={i} className="my-4 space-y-1.5 text-sm leading-relaxed text-ink/75">
                        {block.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/60" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={i} className="mb-5 text-sm leading-relaxed text-ink/75 last:mb-0">
                      {block.items.join(" ")}
                    </p>
                  );
                });
              })()}
            </article>

            {/* Navigation précédent/suivant */}
            <nav className="mt-10 flex items-stretch gap-3" aria-label={t('blog.alsoRead')}>
              {prevPost ? (
                <Link
                  href={`/actualites/${prevPost.slug}`}
                  className="group flex flex-1 items-center gap-2 rounded-lg border border-border bg-white p-3 transition-all duration-200 hover:border-navy/20 hover:shadow-sm"
                >
                  <svg
                    className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 group-hover:-translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{t('blog.prevArticle')}</p>
                    <p className="mt-0.5 truncate text-sm font-medium text-navy transition-colors duration-200 group-hover:text-red">
                      {prevPost.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex-1" />
              )}

              {nextPost ? (
                <Link
                  href={`/actualites/${nextPost.slug}`}
                  className="group flex flex-1 items-center gap-2 rounded-lg border border-border bg-white p-3 text-right transition-all duration-200 hover:border-navy/20 hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{t('blog.nextArticle')}</p>
                    <p className="mt-0.5 truncate text-sm font-medium text-navy transition-colors duration-200 group-hover:text-red">
                      {nextPost.title}
                    </p>
                  </div>
                  <svg
                    className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </nav>
          </div>

          {/* Sidebar — À lire aussi */}
          <Reveal as="div" delay={150}>
            <div className="sticky top-28 space-y-4">
              {suggested.length > 0 && (
                <>
                  {/* Titre en haut */}
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                    <span className="inline-block h-px flex-1 bg-gold/30" />
                    <span>{sameCategory.length > 0 ? t('blog.similarArticles') : t('blog.recentArticles')}</span>
                    <span className="inline-block h-px flex-1 bg-gold/30" />
                  </div>

                  {/* Chaque article dans sa propre carte */}
                  <div className="space-y-4">
                    {suggested.slice(0, 3).map((r) => (
                      <Link
                        key={r.slug}
                        href={`/actualites/${r.slug}`}
                        className="group block"
                      >
                        <div className="overflow-hidden rounded-xl border border-border bg-white transition-all duration-200 hover:border-navy/20 hover:shadow-sm">
                          {/* Image */}
                          <div className="relative h-28 w-full overflow-hidden">
                            <PostIllustration category={r.category} src={r.image} alt={r.imageAlt} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                          </div>
                          {/* Contenu */}
                          <div className="p-3.5">
                            <span className="inline-flex items-center rounded-full bg-navy/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-navy">
                              {r.category}
                            </span>
                            <p className="mt-2 text-xs font-semibold text-navy leading-snug transition-colors duration-200 group-hover:text-red line-clamp-2">
                              {r.title}
                            </p>
                            <p className="mt-1.5 text-[10px] text-muted leading-relaxed line-clamp-2">
                              {r.excerpt}
                            </p>
                            <p className="mt-1.5 text-[9px] text-muted/60">{r.date}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {/* Back link */}
              <div className="pt-1 text-center">
                <Link
                  href="/"
                  className="group inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-navy"
                >
                  <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  <span>{t('common.backToHome')}</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </main>
  );
}
