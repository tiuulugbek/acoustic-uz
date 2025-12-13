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
import { MapPin, Phone } from 'lucide-react';
import { normalizeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';
import { notFound } from 'next/navigation';

// Force dynamic rendering to always fetch fresh data from admin
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PostsPageProps {
  searchParams: Promise<{ category?: string }> | { category?: string };
}

export async function generateMetadata({ searchParams }: PostsPageProps): Promise<Metadata> {
  const locale = detectLocale();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const categorySlug = resolvedSearchParams.category;
  
  let title = locale === 'ru' ? 'Статьи' : 'Maqolalar';
  let description = locale === 'ru' 
    ? 'Полезные статьи о слухе и слуховых аппаратах'
    : 'Quloq va eshitish qurilmalari haqida foydali maqolalar';
  
  if (categorySlug) {
    const category = await getPostCategoryBySlug(categorySlug, locale);
    if (category) {
      title = getBilingualText(category.name_uz, category.name_ru, locale);
      description = getBilingualText(category.description_uz, category.description_ru, locale) || description;
    }
  }
  
  const pageUrl = categorySlug 
    ? `${baseUrl}/posts?category=${categorySlug}`
    : `${baseUrl}/posts`;
  
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

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const locale = detectLocale();
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const categorySlug = resolvedSearchParams.category;
  
  // Get all categories (for sidebar/navigation)
  const [allCategories, branches, settings] = await Promise.all([
    getPostCategories(locale),
    getBranches(locale),
    getSettings(locale),
  ]);
  
  // If category slug is provided, get that specific category
  let selectedCategory = null;
  let categoryId: string | undefined = undefined;
  
  if (categorySlug) {
    try {
      selectedCategory = await getPostCategoryBySlug(categorySlug, locale);
      if (!selectedCategory) {
        // Category not found - show all posts instead of 404
        // This provides better UX - users can still see posts even if category slug is wrong
        console.warn(`[PostsPage] Category not found: ${categorySlug}, showing all posts`);
      } else {
        categoryId = selectedCategory.id;
      }
    } catch (error) {
      // Error fetching category - show all posts instead of crashing
      console.error(`[PostsPage] Error fetching category ${categorySlug}:`, error);
      selectedCategory = null;
    }
  }
  
  // Get posts - filtered by category if provided
  const posts = await getPosts(locale, true, categoryId);
  
  // Filter categories by section if we have a selected category
  // Otherwise show all categories
  const categories = selectedCategory?.section
    ? allCategories.filter(cat => cat.section === selectedCategory.section)
    : allCategories;
  
  // Build page title
  const pageTitle = selectedCategory
    ? getBilingualText(selectedCategory.name_uz, selectedCategory.name_ru, locale)
    : locale === 'ru' ? 'Статьи' : 'Maqolalar';
  
  // Build BreadcrumbList Structured Data
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const pageUrl = categorySlug 
    ? `${baseUrl}/posts?category=${categorySlug}`
    : `${baseUrl}/posts`;
  
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
              {/* Show categories if no specific category is selected */}
              {!selectedCategory && categories && categories.length > 0 && (
                <div className="mb-8">
                  <CategoryGrid categories={categories} locale={locale} />
                </div>
              )}
              
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
                      href="/posts"
                      className="mt-4 inline-block text-sm font-medium text-brand-primary hover:text-brand-accent transition-colors"
                    >
                      {locale === 'ru' ? '← Все статьи' : '← Barcha maqolalar'}
                    </Link>
                  </div>
                </div>
              )}
              
              {/* Posts List with Pagination */}
              {posts && posts.length > 0 ? (
                <div>
                  {!selectedCategory && (
                    <h2 className="mb-6 text-2xl font-bold text-foreground">
                      {locale === 'ru' ? 'Статьи' : 'Maqolalar'}
                    </h2>
                  )}
                  <PostsListPaginated posts={posts} locale={locale} postsPerPage={6} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {locale === 'ru'
                      ? selectedCategory
                        ? 'В этой категории пока нет статей.'
                        : 'Статьи скоро будут добавлены.'
                      : selectedCategory
                        ? 'Bu kategoriyada hozircha maqolalar yo\'q.'
                        : "Maqolalar tez orada qo'shiladi."}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="sticky top-6 h-fit space-y-6">
              {/* Categories List (if viewing all posts) */}
              {!selectedCategory && categories && categories.length > 0 && (
                <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">
                    {locale === 'ru' ? 'Категории' : 'Kategoriyalar'}
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const categoryName = getBilingualText(category.name_uz, category.name_ru, locale);
                      return (
                        <Link
                          key={category.id}
                          href={`/posts?category=${category.slug}`}
                          className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-brand-primary"
                        >
                          {categoryName}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
              
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

