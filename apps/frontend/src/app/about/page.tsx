import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPageBySlug } from '@/lib/api-server';
import { getPosts } from '@/lib/api-server';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';
import PageHeader from '@/components/page-header';
import ServiceContent from '@/components/service-content';
import { notFound } from 'next/navigation';

// Force dynamic rendering to always fetch fresh data from admin
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper to extract YouTube video ID from URL
function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// Helper to build full media URL
function buildMediaUrl(url: string): string {
  if (!url) return '';
  // If URL is already absolute, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // If URL starts with /, it's relative to the backend base URL
  const baseUrl = API_BASE_URL.replace('/api', '');
  return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = detectLocale();
  const page = await getPageBySlug('about', locale);
  
  if (!page || page.status !== 'published') {
    return {
      title: locale === 'ru' ? 'О нас — Acoustic.uz' : 'Biz haqimizda — Acoustic.uz',
      description: locale === 'ru' 
        ? 'Информация о центре Acoustic'
        : 'Acoustic markazi haqida ma\'lumot',
    };
  }

  const title = getBilingualText(page.metaTitle_uz, page.metaTitle_ru, locale) || 
                getBilingualText(page.title_uz, page.title_ru, locale);
  const description = getBilingualText(page.metaDescription_uz, page.metaDescription_ru, locale);

  return {
    title: `${title} — Acoustic.uz`,
    description: description || undefined,
  };
}

export default async function AboutPage() {
  const locale = detectLocale();
  const page = await getPageBySlug('about', locale);

  if (!page || page.status !== 'published') {
    notFound();
  }

  const title = getBilingualText(page.title_uz, page.title_ru, locale);
  const body = getBilingualText(page.body_uz, page.body_ru, locale) || '';

  // Get gallery images from page response
  const galleryImages = page.gallery || [];
  
  // Fetch useful articles
  const allPosts = await getPosts(locale, true);
  const usefulArticles = page.usefulArticleSlugs
    ? allPosts.filter((post) => page.usefulArticleSlugs?.includes(post.slug))
    : [];

  // Extract YouTube video ID
  const videoId = getYouTubeVideoId(page.videoUrl);

  // Extract headings from body for anchor links
  const headings: Array<{ id: string; text: string }> = [];
  if (body) {
    const headingRegex = /<(h[23])[^>]*>(.*?)<\/h[23]>/gi;
    let match;
    let index = 0;
    while ((match = headingRegex.exec(body)) !== null) {
      const text = match[2].replace(/<[^>]*>/g, ''); // Remove HTML tags
      headings.push({ id: `section-${index}`, text });
      index++;
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <PageHeader
        locale={locale}
        breadcrumbs={[
          { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
          { label: title },
        ]}
        title={title}
      />

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {galleryImages.length > 0 && (
              <section className="bg-white rounded-lg p-6">
                <div className="grid grid-cols-3 gap-4">
                  {galleryImages.slice(0, 6).map((media) => {
                    const mediaUrl = buildMediaUrl(media.url);
                    const altText = getBilingualText(media.alt_uz, media.alt_ru, locale) || `Gallery image`;
                    return (
                      <div
                        key={media.id}
                        className="relative aspect-square overflow-hidden rounded-lg bg-muted/40"
                      >
                        <Image
                          src={mediaUrl}
                          alt={altText}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 33vw, 200px"
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Video Section */}
            {videoId && (
              <section className="bg-white rounded-lg p-6">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </section>
            )}

            {/* Content Section */}
            <section className="bg-white rounded-lg p-6">
              <ServiceContent content={body} locale={locale} />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Table of Contents */}
            {headings.length > 0 && (
              <div className="bg-white rounded-lg p-6">
                <h3 className="mb-4 text-lg font-semibold text-brand-accent" suppressHydrationWarning>
                  {locale === 'ru' ? 'В этой статье' : 'Ushbu maqolada'}
                </h3>
                <nav className="space-y-2">
                  {headings.map((heading) => (
                    <Link
                      key={heading.id}
                      href={`#${heading.id}`}
                      className="block text-sm text-brand-primary hover:text-brand-accent transition"
                      suppressHydrationWarning
                    >
                      {heading.text}
                    </Link>
                  ))}
                </nav>
              </div>
            )}

            {/* Useful Articles */}
            {usefulArticles.length > 0 && (
              <div className="bg-white rounded-lg p-6">
                <h3 className="mb-4 text-lg font-semibold text-brand-accent" suppressHydrationWarning>
                  {locale === 'ru' ? 'Полезные статьи' : 'Foydali maqolalar'}
                </h3>
                <div className="space-y-4">
                  {usefulArticles.map((article) => {
                    const articleTitle = getBilingualText(article.title_uz, article.title_ru, locale);
                    const articleExcerpt = getBilingualText(article.excerpt_uz, article.excerpt_ru, locale);
                    const coverUrl = article.cover?.url
                      ? buildMediaUrl(article.cover.url)
                      : null;
                    
                    return (
                      <Link
                        key={article.id}
                        href={`/posts/${article.slug}`}
                        className="group flex gap-3 transition hover:opacity-80"
                      >
                        {coverUrl && (
                          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted/40">
                            <Image
                              src={coverUrl}
                              alt={articleTitle}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-brand-primary group-hover:text-brand-accent line-clamp-2" suppressHydrationWarning>
                            {articleTitle}
                          </h4>
                          {articleExcerpt && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2" suppressHydrationWarning>
                              {articleExcerpt}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
