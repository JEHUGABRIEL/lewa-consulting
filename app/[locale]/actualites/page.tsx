import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import PostIllustration from "@/components/PostIllustration";
import CTASection from "@/components/CTASection";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";
import { getPublicPosts } from "@/lib/admin/public";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata");
  const title = t("actualites");
  const description = t("actualitesDescription");
  return {
    title,
    description,
    alternates: {
      canonical: `https://www.lewaconsultingroup.com/${locale}/actualites`,
      languages: {
        fr: "https://www.lewaconsultingroup.com/fr/actualites",
        en: "https://www.lewaconsultingroup.com/en/actualites",
        "x-default": "https://www.lewaconsultingroup.com/fr/actualites",
      },
    },
    openGraph: {
      type: "website",
      url: `https://www.lewaconsultingroup.com/${locale}/actualites`,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ActualitesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const posts = await getPublicPosts();

  return (
    <main>
      <PageHeader
        texts={[
          {
            title: t('blog.pageTitle1'),
            lead: t('blog.pageLead1'),
          },
          {
            title: t('blog.pageTitle2'),
            lead: t('blog.pageLead2'),
          },
          {
            title: t('blog.pageTitle3'),
            lead: t('blog.pageLead3'),
          },
        ]}
        backgrounds={getHeroBackgrounds("formations")}
      />

      <Container className="py-14 sm:py-16">
        { }
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/actualites/${post.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm hover-lift"
            >
              { }
              <div className="relative h-44 w-full overflow-hidden sm:h-52">
                <PostIllustration category={post.category} src={post.image} alt={t(`posts.${post.slug}.imageAlt`)} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
              </div>

              { }
              <div className="flex flex-1 flex-col p-5 lg:p-6">
                { }
                <span className="inline-flex items-center self-start rounded-full bg-navy/[0.06] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-navy">
                  {t(`posts.${post.slug}.category`)}
                </span>

                { }
                {t(`posts.${post.slug}.date`) && (
                  <p className="mt-1.5 text-[11px] text-muted">{t(`posts.${post.slug}.date`)}</p>
                )}

                { }
                <h2 className="mt-1.5 font-display text-base font-semibold text-navy leading-snug transition-colors duration-200 group-hover:text-red">
                  {t(`posts.${post.slug}.title`)}
                </h2>

                { }
                <p className="mt-2 text-xs leading-relaxed text-muted flex-1">
                  {t(`posts.${post.slug}.excerpt`)}
                </p>

                { }
                <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-xs font-medium text-navy transition-colors duration-200 group-hover:text-red">
                  <span>{t('common.readMore')}</span>
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </Container>

      { }
      {posts.length > 1 && (
        <section className="border-y border-navy/[0.08] bg-gradient-to-b from-navy/[0.06] to-navy/[0.02]">
          <Container className="py-12 sm:py-16">
            <h2 className="font-display text-xl text-navy">
              {t('blog.alsoRead')}
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              {t('blog.alsoReadSubtitle')}
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[...posts].reverse().slice(0, 3).map((post) => (
                <Link
                  key={post.slug}
                  href={`/actualites/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm hover-lift"
                >
                  <div className="relative h-28 w-full overflow-hidden sm:h-32">
                    <PostIllustration category={post.category} src={post.image} alt={t(`posts.${post.slug}.imageAlt`)} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <span className="inline-flex items-center self-start rounded-full bg-navy/[0.06] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-navy">
                      {t(`posts.${post.slug}.category`)}
                    </span>
                    {t(`posts.${post.slug}.date`) && (
                      <p className="mt-1.5 text-[11px] text-muted">{t(`posts.${post.slug}.date`)}</p>
                    )}
                    <h3 className="mt-1.5 font-display text-sm font-semibold text-navy leading-snug transition-colors duration-200 group-hover:text-red">
                      {t(`posts.${post.slug}.title`)}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted flex-1 line-clamp-2">
                      {t(`posts.${post.slug}.excerpt`)}
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-xs font-medium text-navy transition-colors duration-200 group-hover:text-red">
                      <span>{t('blog.readShort')}</span>
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      <CTASection page="blog" />
    </main>
  );
}
