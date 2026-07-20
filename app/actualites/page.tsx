import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import PostIllustration from "@/components/PostIllustration";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";
import { posts } from "@/lib/posts";

export const metadata: Metadata = { title: "Actualités" };

export default async function ActualitesPage() {
  const t = await getTranslations();

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
        {/* Tous les articles */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/actualites/${post.slug}`}
              className="group flex h-full flex-col rounded-xl border border-border bg-white p-5 hover-lift lg:p-7"
            >
              {/* Illustration */}
              <div className="mb-3 h-40 w-full overflow-hidden rounded-lg">
                <PostIllustration category={post.category} src={post.image} alt={post.imageAlt} />
              </div>

              {/* Category badge */}
              <span className="inline-flex items-center self-start rounded-full bg-navy/[0.06] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-navy">
                {post.category}
              </span>

              {/* Date */}
              <p className="mt-1.5 text-[11px] text-muted">{post.date}</p>

              {/* Title */}
              <h2 className="mt-1.5 font-display text-sm font-semibold text-navy leading-snug transition-colors duration-200 group-hover:text-red">
                {post.title}
              </h2>

              {/* Excerpt */}
              <p className="mt-2 text-xs leading-relaxed text-muted flex-1">
                {post.excerpt}
              </p>

              {/* Read more */}
              <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-xs font-medium text-navy transition-colors duration-200 group-hover:text-red">
                <span>{t('common.readMore')}</span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Compteur total */}
        <p className="mt-8 text-xs text-muted">
          {t('blog.articleCount', { count: posts.length })}
        </p>

        {/* À lire aussi — articles recommandés (ordre différent pour varier) */}
        {posts.length > 1 && (
          <section className="mt-14 border-t border-border pt-10">
            <h2 className="font-display text-xl text-navy">
              {t('blog.alsoRead')}
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              {t('blog.alsoReadSubtitle')}
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...posts].reverse().slice(0, 3).map((post) => (
                <Link
                  key={post.slug}
                  href={`/actualites/${post.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-border bg-white p-5 hover-lift lg:p-7"
                >
                  <div className="mb-3 h-24 w-full overflow-hidden rounded-lg">
                    <PostIllustration category={post.category} src={post.image} alt={post.imageAlt} />
                  </div>
                  <span className="inline-flex items-center self-start rounded-full bg-navy/[0.06] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-navy">
                    {post.category}
                  </span>
                  <p className="mt-1.5 text-[11px] text-muted">{post.date}</p>
                  <h3 className="mt-1.5 font-display text-sm font-semibold text-navy leading-snug transition-colors duration-200 group-hover:text-red">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted flex-1 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-xs font-medium text-navy transition-colors duration-200 group-hover:text-red">
                    <span>{t('blog.readShort')}</span>
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
