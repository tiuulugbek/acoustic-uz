import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { Calendar, Tag, ArrowLeft } from 'lucide-react';
import { getPostBySlug, getPosts, getBrands, getSettings } from '@/lib/api-server';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';
import PageHeader from '@/components/page-header';
import ServiceContent from '@/components/service-content';
import AppointmentForm from '@/components/appointment-form';
import AuthorCard from '@/components/author-card';
import Sidebar from '@/components/sidebar';
import ArticleTableOfContents from '@/components/article-table-of-contents';
import { notFound } from 'next/navigation';
import dayjs from 'dayjs';
import { normalizeImageUrl } from '@/lib/image-utils';
import { optimizeMetaDescription, optimizeTitle } from '@/lib/seo-utils';

// ISR: Revalidate every 2 hours
export const revalidate = 7200;

interface NewsPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const locale = detectLocale();
  const post = await getPostBySlug(params.slug, locale);

  if (!post || post.status !== 'published' || post.postType !== 'news') {
    return {
      title: locale === 'ru' ? 'Новость — Acoustic.uz' : 'Yangilik — Acoustic.uz',
      description: locale === 'ru' 
        ? 'Новость не найдена'
        : 'Yangilik topilmadi',
    };
  }

  const title = getBilingualText(post.title_uz, post.title_ru, locale);
  const rawDescription = getBilingualText(post.excerpt_uz, post.excerpt_ru, locale) || 
                         getBilingualText(post.body_uz, post.body_ru, locale)?.replace(/<[^>]*>/g, '');
  
  const optimizedTitle = optimizeTitle(title);
  const optimizedDescription = optimizeMetaDescription(rawDescription);
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const newsUrl = `${baseUrl}/news/${params.slug}`;
  const imageUrl = post.cover?.url 
    ? (post.cover.url.startsWith('http') 
        ? post.cover.url 
        : `${baseUrl}${post.cover.url}`)
    : `${baseUrl}/logo.png`;

  return {
    title: optimizedTitle,
    description: optimizedDescription,
    alternates: {
      canonical: newsUrl,
      languages: {
        uz: newsUrl,
        ru: newsUrl,
        'x-default': newsUrl,
      },
    },
    openGraph: {
      title: optimizedTitle,
      description: optimizedDescription,
      url: newsUrl,
      siteName: 'Acoustic.uz',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === 'ru' ? 'ru_RU' : 'uz_UZ',
      type: 'article',
      publishedTime: post.publishAt ? new Date(post.publishAt).toISOString() : undefined,
      modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
      authors: post.author ? [post.author.name] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: optimizedTitle,
      description: optimizedDescription,
      images: [imageUrl],
    },
  };
}

export default async function NewsPage({ params }: NewsPageProps) {
  const locale = detectLocale();
  const [post, brands, settings] = await Promise.all([
    getPostBySlug(params.slug, locale),
    getBrands(locale),
    getSettings(locale),
  ]);

  if (!post || post.status !== 'published' || post.postType !== 'news') {
    notFound();
  }

  const title = getBilingualText(post.title_uz, post.title_ru, locale);
  const body = getBilingualText(post.body_uz, post.body_ru, locale) || '';
  const excerpt = getBilingualText(post.excerpt_uz, post.excerpt_ru, locale);
  const categoryName = post.category 
    ? getBilingualText(post.category.name_uz, post.category.name_ru, locale)
    : null;
  const coverUrl = post.cover?.url ? normalizeImageUrl(post.cover.url) : null;

  // Extract table of contents from HTML content
  const extractTableOfContents = (content: string) => {
    if (!content) return [];
    
    const headings: Array<{ id: string; text: string; level: number }> = [];
    let headingIndex = 0;
    
    const headingRegex = /<(h[23])([^>]*)>(.*?)<\/h[23]>/gi;
    
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      const tag = match[1];
      const attrs = match[2] || '';
      const text = match[3]
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
      
      if (text) {
        const level = tag === 'h2' ? 2 : 3;
        const idMatch = attrs.match(/id=["']([^"']+)["']/i);
        const id = idMatch ? idMatch[1] : `section-${headingIndex++}`;
        headings.push({ id, text, level });
      }
    }
    
    return headings;
  };

  const tableOfContents = extractTableOfContents(body);

  // Get related news posts
  const allPosts = await getPosts(locale, true, undefined, 'news');
  const relatedPosts = allPosts
    .filter(p => p.id !== post.id && p.status === 'published')
    .slice(0, 3);

  // Build Article Structured Data
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const newsUrl = `${baseUrl}/news/${post.slug}`;
  const articleImageUrl = coverUrl 
    ? (coverUrl.startsWith('http') ? coverUrl : `${baseUrl}${coverUrl}`)
    : `${baseUrl}/logo.png`;
  
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    image: articleImageUrl,
    datePublished: post.publishAt ? new Date(post.publishAt).toISOString() : undefined,
    dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
    author: post.author ? {
      '@type': 'Person',
      name: post.author.name,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Acoustic.uz',
      logo: {
        '@type': 'ImageObject',
        url: settings?.logo?.url 
          ? (settings.logo.url.startsWith('http') 
              ? settings.logo.url 
              : `${baseUrl}${settings.logo.url}`)
          : `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': newsUrl,
    },
    description: excerpt || undefined,
    articleSection: categoryName || (locale === 'ru' ? 'Новости' : 'Yangiliklar'),
  };

  // Build BreadcrumbList Structured Data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'ru' ? 'Главная' : 'Bosh sahifa',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: locale === 'ru' ? 'Новости' : 'Yangiliklar',
        item: `${baseUrl}/news`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: newsUrl,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background">
      <Script
        id="article-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PageHeader
        locale={locale}
        breadcrumbs={[
          { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
          { 
            label: locale === 'ru' ? 'Новости' : 'Yangiliklar', 
            href: '/news' 
          },
          { label: title },
        ]}
        title={title}
      />

      <article className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Link
                href="/news"
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-primary hover:text-brand-accent transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {locale === 'ru' ? 'Назад к новостям' : 'Yangiliklarga qaytish'}
              </Link>

              <h1 className="mb-4 text-4xl font-bold leading-tight text-foreground">
                {title}
              </h1>

              <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.publishAt}>
                    {dayjs(post.publishAt).format('DD.MM.YYYY')}
                  </time>
                </div>
                {categoryName && (
                  <Link
                    href="/news"
                    className="flex items-center gap-2 rounded-full bg-brand-primary/10 px-3 py-1 text-brand-primary hover:bg-brand-primary/20 transition-colors"
                  >
                    <Tag className="h-3 w-3" />
                    {categoryName}
                  </Link>
                )}
                <span className="rounded-full bg-muted px-3 py-1">
                  {locale === 'ru' ? '📰 Новость' : '📰 Yangilik'}
                </span>
              </div>

              {coverUrl && (
                <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={coverUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 896px"
                    priority
                  />
                </div>
              )}

              {excerpt && (
                <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                  {excerpt}
                </p>
              )}

              <article className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-foreground prose-headings:mt-8 prose-headings:mb-4 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-base prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-strong:font-semibold prose-img:rounded-lg prose-img:shadow-md prose-img:my-6 prose-img:w-full prose-ul:list-disc prose-ol:list-decimal prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-brand-primary prose-blockquote:pl-4 prose-blockquote:italic">
                <ServiceContent content={body} locale={locale} />
              </article>

              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border pt-6">
                  <span className="text-sm font-medium text-foreground">
                    {locale === 'ru' ? 'Теги:' : 'Teglar:'}
                  </span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {post.author && (
                <AuthorCard author={post.author} locale={locale} />
              )}

              <div className="mt-8 bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 rounded-lg p-6">
                <div className="mb-4">
                  <h2 className="mb-2 text-2xl font-bold text-foreground">
                    {locale === 'ru' ? 'Записаться на консультацию' : 'Maslahat uchun yozilish'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'ru'
                      ? 'Наши специалисты готовы ответить на все ваши вопросы и помочь подобрать оптимальное решение для вашего слуха.'
                      : 'Bizning mutaxassislarimiz barcha savollaringizga javob berishga va eshitishingiz uchun eng yaxshi yechimni topishga tayyor.'}
                  </p>
                </div>
                <AppointmentForm locale={locale} doctorId={post.authorId || null} source={`news-${post.slug}`} />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {tableOfContents.length > 0 && (
                  <ArticleTableOfContents items={tableOfContents} locale={locale} />
                )}
                <Sidebar locale={locale} settingsData={settings} brandsData={brands} pageType="posts" />
              </div>
            </div>
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="bg-muted/30 py-12">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              {locale === 'ru' ? 'Похожие новости' : 'O\'xshash yangiliklar'}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => {
                const relatedTitle = getBilingualText(relatedPost.title_uz, relatedPost.title_ru, locale);
                const relatedExcerpt = getBilingualText(relatedPost.excerpt_uz, relatedPost.excerpt_ru, locale) || 
                                     getBilingualText(relatedPost.body_uz, relatedPost.body_ru, locale)?.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
                const relatedCoverUrl = relatedPost.cover?.url ? normalizeImageUrl(relatedPost.cover.url) : null;

                return (
                  <Link
                    key={relatedPost.id}
                    href={`/news/${relatedPost.slug}`}
                    className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {relatedCoverUrl && (
                      <div className="relative aspect-video w-full overflow-hidden bg-muted">
                        <Image
                          src={relatedCoverUrl}
                          alt={relatedTitle}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="mb-2 text-lg font-semibold leading-tight text-foreground line-clamp-2 group-hover:text-brand-primary transition-colors">
                        {relatedTitle}
                      </h3>
                      {relatedExcerpt && (
                        <p className="mb-0 flex-1 text-sm text-muted-foreground line-clamp-3">
                          {relatedExcerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

