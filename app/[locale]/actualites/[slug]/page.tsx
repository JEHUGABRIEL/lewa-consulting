import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import PostIllustration from "@/components/PostIllustration";
import HeroSlider from "@/components/HeroSlider";
import { getPublicPosts, getPublicPostBySlug } from "@/lib/admin/public";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const posts = await getPublicPosts();
  return routing.locales.flatMap((locale) =>
    posts.map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await getPublicPostBySlug(slug);
  const t = await getTranslations();
  if (!post) {
    return { title: t('blog.notFound') };
  }
  const title = t(`posts.${post.slug}.title`);
  const description = t(`posts.${post.slug}.excerpt`);

  const image = `${post.image.split("?")[0]}?w=1200&h=630&fit=crop&crop=faces`;
  return {
    title,
    description,
    alternates: {
      canonical: `https://www.lewaconsultingroup.com/${locale}/actualites/${post.slug}`,
      languages: {
        fr: `https://www.lewaconsultingroup.com/fr/actualites/${post.slug}`,
        en: `https://www.lewaconsultingroup.com/en/actualites/${post.slug}`,
        "x-default": `https://www.lewaconsultingroup.com/fr/actualites/${post.slug}`,
      },
    },
    openGraph: {
      type: "article",
      url: `https://www.lewaconsultingroup.com/${locale}/actualites/${post.slug}`,
      title,
      description,
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const posts = await getPublicPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const t = await getTranslations();


  const currentIndex = posts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;


  const lines = t.raw(`posts.${post.slug}.content`).split("\n");



  const sameCategory = posts.filter(
    (p) => p.slug !== post.slug && p.category === post.category,
  );
  const suggested = sameCategory.length > 0
    ? sameCategory
    : posts.filter((p) => p.slug !== post.slug).slice(0, 4);
  const heroBgs = getHeroBackgrounds("formations");

  const postTitle = t(`posts.${post.slug}.title`);
  const canonical = `https://www.lewaconsultingroup.com/${locale}/actualites/${post.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: postTitle,
    description: t(`posts.${post.slug}.excerpt`),
    image: post.image.split("?")[0],
    url: canonical,
    inLanguage: locale,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    author: { "@type": "Organization", name: t("legal.companyName") },
    publisher: {
      "@type": "Organization",
      name: t("legal.companyName"),
      logo: {
        "@type": "ImageObject",
        url: "https://res.cloudinary.com/dwmrzp61c/image/upload/images/favicon_lewa.png",
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("nav.home"), item: `https://www.lewaconsultingroup.com/${locale}` },
      { "@type": "ListItem", position: 2, name: t("nav.actualites"), item: `https://www.lewaconsultingroup.com/${locale}/actualites` },
      { "@type": "ListItem", position: 3, name: postTitle, item: canonical },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      { }
      <section className="relative overflow-hidden">
        <HeroSlider slides={heroBgs} interval={5000} />

        <Container className="relative z-10 py-24 sm:py-[7.5rem]">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80">
                {t(`posts.${post.slug}.category`)}
              </span>
              {t(`posts.${post.slug}.date`) && (
                <span className="text-xs text-white/50">{t(`posts.${post.slug}.date`)}</span>
              )}
            </div>

            <h1 className="mt-4 font-display text-3xl leading-tight text-white sm:text-4xl">
              {postTitle}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
              {t(`posts.${post.slug}.excerpt`)}
            </p>
          </div>
        </Container>
      </section>

      { }
      <Container className="py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          { }
          <div className="min-w-0">
            { }
            <article className="max-w-none">
              {(() => {

                const blocks: { type: "p" | "list"; items: string[] }[] = [];
                let current: { type: "p" | "list"; items: string[] } | null = null;

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed) {

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

            { }
            <nav className="mt-10 flex items-stretch gap-3" aria-label={t('blog.alsoRead')}>
              {prevPost ? (
                <Link
                  href={`/actualites/${prevPost.slug}`}
                  className="group flex flex-1 items-center gap-2 rounded-lg border border-transparent bg-white p-3 shadow-sm transition-all duration-200 hover:border-navy/20 hover:shadow-md"
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
                      {t(`posts.${prevPost.slug}.title`)}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex-1" />
              )}

              {nextPost ? (
                <Link
                  href={`/actualites/${nextPost.slug}`}
                  className="group flex flex-1 items-center gap-2 rounded-lg border border-transparent bg-white p-3 text-right transition-all duration-200 hover:border-navy/20 hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{t('blog.nextArticle')}</p>
                    <p className="mt-0.5 truncate text-sm font-medium text-navy transition-colors duration-200 group-hover:text-red">
                      {t(`posts.${nextPost.slug}.title`)}
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

          { }
          <Reveal as="div" delay={150} className="min-w-0">
            <div className="sticky top-28 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain [scrollbar-width:thin] space-y-4">
              {suggested.length > 0 && (
                <>
                  { }
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                    <span className="inline-block h-px flex-1 bg-gold/30" />
                    <span>{sameCategory.length > 0 ? t('blog.similarArticles') : t('blog.recentArticles')}</span>
                    <span className="inline-block h-px flex-1 bg-gold/30" />
                  </div>

                  { }
                  <div className="space-y-4">
                    {suggested.slice(0, 3).map((r) => (
                      <Link
                        key={r.slug}
                        href={`/actualites/${r.slug}`}
                        className="group block"
                      >
                        <div className="overflow-hidden rounded-xl border border-transparent bg-white shadow-sm transition-all duration-200 hover:border-navy/20 hover:shadow-md">
                          { }
                          <div className="relative h-28 w-full overflow-hidden">
                            <PostIllustration category={r.category} src={r.image} alt={t(`posts.${r.slug}.imageAlt`)} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                          </div>
                          { }
                          <div className="p-3.5">
                            <span className="inline-flex items-center rounded-full bg-navy/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-navy">
                              {t(`posts.${r.slug}.category`)}
                            </span>
                            <p className="mt-2 text-xs font-semibold text-navy leading-snug transition-colors duration-200 group-hover:text-red line-clamp-2">
                              {t(`posts.${r.slug}.title`)}
                            </p>
                            <p className="mt-1.5 text-[10px] text-muted leading-relaxed line-clamp-2">
                              {t(`posts.${r.slug}.excerpt`)}
                            </p>
                            <p className="mt-1.5 text-[9px] text-muted/60">{t(`posts.${r.slug}.date`)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              { }
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
