import type { Metadata } from 'next';
import { getPageBySlug, getPosts, getPostCategories, getBranches } from '@/lib/api-server';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';
import PageHeader from '@/components/page-header';
import PostsListPaginated from '@/components/posts-list-paginated';
import CategoryGrid from '@/components/category-grid';
import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import { normalizeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';

// Force dynamic rendering to always fetch fresh data from admin
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const locale = detectLocale();
  const page = await getPageBySlug('patients', locale);
  
  if (!page || page.status !== 'published') {
    return {
      title: locale === 'ru' ? 'Пациентам — Acoustic.uz' : 'Bemorlar — Acoustic.uz',
      description: locale === 'ru' 
        ? 'Информация для пациентов'
        : 'Bemorlar uchun ma\'lumot',
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

export default async function PatientsPage() {
  const locale = detectLocale();
  const [page, categories, branches] = await Promise.all([
    getPageBySlug('patients', locale),
    getPostCategories(locale, 'patients'),
    getBranches(locale),
  ]);
  
  // Get posts from categories in this section
  const categoryIds = categories?.map(cat => cat.id) || [];
  let posts: any[] = [];
  
  if (categoryIds.length > 0) {
    // Get posts from categories
    const allPosts = await Promise.all(
      categoryIds.map(categoryId => getPosts(locale, true, categoryId, 'article'))
    );
    posts = allPosts.flat().filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id)
    );
  }
  
  // Also get all articles and filter by section (if they belong to section categories)
  // This ensures posts are shown even if they're not directly linked to categories
  const allArticles = await getPosts(locale, true, undefined, 'article');
  const sectionArticles = allArticles.filter(post => {
    // Include if post belongs to a category in this section
    if (post.categoryId && categoryIds.includes(post.categoryId)) {
      return true;
    }
    // Also include posts without category (for backward compatibility)
    // But only if they are articles
    if (!post.categoryId && post.postType === 'article') {
      return true;
    }
    return false;
  });
  
  // Combine and deduplicate
  const allPostsCombined = [...posts, ...sectionArticles];
  posts = allPostsCombined.filter((post, index, self) => 
    index === self.findIndex(p => p.id === post.id)
  );

  // Use fallback if page doesn't exist or is not published
  const title = page && page.status === 'published' 
    ? getBilingualText(page.title_uz, page.title_ru, locale)
    : locale === 'ru' ? 'Пациентам' : 'Bemorlar';

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

      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Main Content */}
            <div className="min-w-0">
              {/* Categories Grid */}
              {categories && categories.length > 0 && (
                <div className="mb-8">
                  <CategoryGrid categories={categories} locale={locale} />
                </div>
              )}
              
              {/* Posts List with Pagination */}
              {posts && posts.length > 0 && (
                <div>
                  <h2 className="mb-6 text-2xl font-bold text-foreground">
                    {locale === 'ru' ? 'Статьи' : 'Maqolalar'}
                  </h2>
                  <PostsListPaginated posts={posts} locale={locale} postsPerPage={6} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="sticky top-6 h-fit space-y-6">
              {/* Branches Card */}
              {branches && branches.length > 0 && (
                <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">
                    {locale === 'ru' ? 'Наши филиалы' : 'Bizning filiallarimiz'}
                  </h3>
                  <div className="space-y-4">
                    {branches.slice(0, 3).map((branch) => {
                      const branchName = getBilingualText(branch.name_uz, branch.name_ru, locale);
                      const branchAddress = getBilingualText(branch.address_uz, branch.address_ru, locale);
                      const imageUrl = branch.image?.url ? normalizeImageUrl(branch.image.url) : null;
                      
                      return (
                        <Link
                          key={branch.id}
                          href={`/branches/${branch.slug}`}
                          className="group block rounded-lg border border-border bg-white p-3 transition-shadow hover:shadow-md"
                        >
                          {imageUrl && (
                            <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-md bg-muted">
                              <Image
                                src={imageUrl}
                                alt={branchName}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                                sizes="(max-width: 1024px) 100vw, 320px"
                              />
                            </div>
                          )}
                          <h4 className="mb-1 text-sm font-semibold text-foreground group-hover:text-brand-primary transition-colors">
                            {branchName}
                          </h4>
                          {branchAddress && (
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-brand-primary" />
                              <span className="line-clamp-2">{branchAddress}</span>
                            </div>
                          )}
                          {branch.phone && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-brand-primary">
                              <Phone className="h-3 w-3" />
                              <span>{branch.phone}</span>
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                  <Link
                    href="/branches"
                    className="mt-4 block text-center text-sm font-medium text-brand-primary hover:text-brand-accent transition-colors"
                  >
                    {locale === 'ru' ? 'Все филиалы →' : 'Barcha filiallar →'}
                  </Link>
                </div>
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

