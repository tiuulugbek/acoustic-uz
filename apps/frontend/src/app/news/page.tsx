import type { Metadata } from 'next';
import Script from 'next/script';
import { getPosts, getPostCategoryBySlug, getPostCategories, getBranches, getSettings } from '@/lib/api-server';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';
import PageHeader from '@/components/page-header';
import PostsListPaginated from '@/components/posts-list-paginated';
import CategoryGrid from '@/components/category-grid';
import NearbyBranches from '@/components/nearby-branches';
import Link from 'next/link';

// Force dynamic rendering to always fetch fresh data from admin
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface NewsPageProps {
  searchParams: Promise<{ category?: string }> | { category?: string };
}

export async function generateMetadata({ searchParams }: NewsPageProps): Promise<Metadata> {
  const locale = detectLocale();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const categorySlug = resolvedSearchParams.category;
  
  let title = locale === 'ru' ? 'Новости' : 'Yangiliklar';
  let description = locale === 'ru' 
    ? 'Последние новости о слуховых аппаратах и слухе'
    : 'Eshitish qurilmalari va eshitish haqida so\'nggi yangiliklar';
  
  if (categorySlug) {
    const category = await getPostCategoryBySlug(categorySlug, locale);
    if (category) {
      title = getBilingualText(category.name_uz, category.name_ru, locale);
      description = getBilingualText(category.description_uz, category.description_ru, locale) || description;
    }
  }
  
  const pageUrl = categorySlug 
    ? `${baseUrl}/news?category=${categorySlug}`
    : `${baseUrl}/news`;
  
  return {
    title: `${title} — Acoustic.uz`,
    description,
    alternates: {
      canonical: pageUrl,
      languages: {
        uz: pageUrl,
        ru: pageUrl,
        'x-default': pageUrl,
      },
    },
    openGraph: {
      title: `${title} — Acoustic.uz`,
      description,
      url: pageUrl,
      siteName: 'Acoustic.uz',
      locale: locale === 'ru' ? 'ru_RU' : 'uz_UZ',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — Acoustic.uz`,
      description,
    },
  };
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const locale = detectLocale();
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const categorySlug = resolvedSearchParams.category;
  
  // Get all categories
  const [allCategories, branches, settings] = await Promise.all([
    getPostCategories(locale),
    getBranches(locale),
    getSettings(locale),
  ]);
  
  // Filter categories: ONLY show "news" section categories
  const newsCategories = allCategories.filter(cat => cat.section === 'news');
  
  // If category slug is provided, get that specific category
  let selectedCategory = null;
  let categoryId: string | undefined = undefined;
  
  if (categorySlug) {
    try {
      selectedCategory = await getPostCategoryBySlug(categorySlug, locale);
      if (!selectedCategory) {
        console.warn(`[NewsPage] Category not found: ${categorySlug}, showing all news`);
      } else {
        // Only allow "news" section categories
        if (selectedCategory.section === 'news') {
          categoryId = selectedCategory.id;
        } else {
          // Category belongs to another section - don't show it here
          console.warn(`[NewsPage] Category ${categorySlug} belongs to ${selectedCategory.section} section, not showing here`);
          selectedCategory = null;
        }
      }
    } catch (error) {
      console.error(`[NewsPage] Error fetching category ${categorySlug}:`, error);
      selectedCategory = null;
    }
  }
  
  // Get all posts and filter for news only
  const allPosts = await getPosts(locale, true, undefined);
  const newsPosts = allPosts.filter(post => {
    // Only show news posts
    if (post.postType !== 'news') return false;
    
    // If filtering by category, only show posts in that category
    if (categoryId) {
      return post.categoryId === categoryId;
    }
    
    // Show all news posts, but only if they belong to "news" section categories or have no category
    if (!post.categoryId) return true; // Uncategorized news posts
    const postCategory = allCategories.find(cat => cat.id === post.categoryId);
    if (!postCategory) return true; // Category not found
    return postCategory.section === 'news'; // Only show if category belongs to "news" section
  });
  
  const posts = newsPosts;
  
  // Build page title
  const pageTitle = selectedCategory
    ? getBilingualText(selectedCategory.name_uz, selectedCategory.name_ru, locale)
    : locale === 'ru' ? 'Новости' : 'Yangiliklar';
  
  // Build BreadcrumbList Structured Data
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const pageUrl = categorySlug 
    ? `${baseUrl}/news?category=${categorySlug}`
    : `${baseUrl}/news`;
  
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
        name: pageTitle,
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background">
      {/* BreadcrumbList Structured Data */}
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PageHeader
        locale={locale}
        breadcrumbs={[
          { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
          { label: pageTitle },
        ]}
        title={pageTitle}
      />

      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Main Content */}
            <div className="min-w-0">
              {/* Show selected category info */}
              {selectedCategory && (
                <div className="mb-8">
                  <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
                    <h2 className="mb-2 text-2xl font-bold text-foreground">
                      {getBilingualText(selectedCategory.name_uz, selectedCategory.name_ru, locale)}
                    </h2>
                    {selectedCategory.description_uz || selectedCategory.description_ru ? (
                      <p className="text-muted-foreground">
                        {getBilingualText(selectedCategory.description_uz, selectedCategory.description_ru, locale)}
                      </p>
                    ) : null}
                    <Link
                      href="/news"
                      className="mt-4 inline-block text-sm font-medium text-brand-primary hover:text-brand-accent transition-colors"
                    >
                      {locale === 'ru' ? '← Все новости' : '← Barcha yangiliklar'}
                    </Link>
                  </div>
                </div>
              )}
              
              {/* News List with Pagination */}
              {posts && posts.length > 0 ? (
                <div>
                  {!selectedCategory && (
                    <h2 className="mb-6 text-2xl font-bold text-foreground">
                      {locale === 'ru' ? 'Новости' : 'Yangiliklar'}
                    </h2>
                  )}
                  <PostsListPaginated posts={posts} locale={locale} postsPerPage={6} basePath="/news" />
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {locale === 'ru'
                      ? selectedCategory
                        ? 'В этой категории пока нет новостей.'
                        : 'Новости скоро будут добавлены.'
                      : selectedCategory
                        ? 'Bu kategoriyada hozircha yangiliklar yo\'q.'
                        : "Yangiliklar tez orada qo'shiladi."}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="sticky top-6 h-fit space-y-6">
              {/* Branches Card - Show nearby branches */}
              {branches && branches.length > 0 && (
                <NearbyBranches branches={branches} locale={locale} limit={3} />
              )}

              {/* Contact Card */}
              <div className="rounded-lg border border-border bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 p-6">
                <h3 className="mb-3 text-lg font-semibold text-foreground">
                  {locale === 'ru' ? 'Связаться с нами' : 'Biz bilan bog\'laning'}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {locale === 'ru' 
                    ? 'Наши специалисты готовы ответить на все ваши вопросы.'
                    : 'Bizning mutaxassislarimiz barcha savollaringizga javob berishga tayyor.'}
                </p>
                <Link
                  href="/contact"
                  className="block w-full rounded-md bg-brand-primary px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-brand-accent"
                >
                  {locale === 'ru' ? 'Связаться' : 'Bog\'lanish'}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

