import type { Metadata } from 'next';
import { getPageBySlug, getPosts, getPostCategories } from '@/lib/api-server';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';
import PageHeader from '@/components/page-header';
import ServiceContent from '@/components/service-content';
import PostsListPaginated from '@/components/posts-list-paginated';
import CategoryGrid from '@/components/category-grid';
import { notFound } from 'next/navigation';

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
  const [page, categories] = await Promise.all([
    getPageBySlug('patients', locale),
    getPostCategories(locale, 'patients'),
  ]);
  
  // Get all posts from categories in this section, or posts without category
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
  
  // Also get posts without category (for backward compatibility)
  const allPostsWithoutCategory = await getPosts(locale, true, undefined, 'article');
  const postsWithoutCategory = allPostsWithoutCategory.filter(post => !post.categoryId);
  
  // Combine and deduplicate
  const allPostsCombined = [...posts, ...postsWithoutCategory];
  posts = allPostsCombined.filter((post, index, self) => 
    index === self.findIndex(p => p.id === post.id)
  );

  // Use fallback if page doesn't exist or is not published
  const title = page && page.status === 'published' 
    ? getBilingualText(page.title_uz, page.title_ru, locale)
    : locale === 'ru' ? 'Пациентам' : 'Bemorlar';
  const body = page && page.status === 'published'
    ? getBilingualText(page.body_uz, page.body_ru, locale) || ''
    : '';

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
          {body && (
            <div className="mb-8">
              <ServiceContent content={body} locale={locale} />
            </div>
          )}
          
          {!body && (
            <div className="mb-8">
              <p className="text-lg text-muted-foreground">
                {locale === 'ru' 
                  ? 'В этом разделе вы найдете полную информацию о том, как устроен слух человека, какие причины влияют на его ухудшение, что такое тугоухость и можно ли ее вылечить.'
                  : 'Ushbu bo\'limda siz odam eshitish organi qanday tuzilgan, uning yomonlashishiga qanday sabablar ta\'sir qiladi, tugouxoсть nima va uni davolash mumkinmi haqida to\'liq ma\'lumot topasiz.'}
              </p>
            </div>
          )}

          {/* Categories Grid */}
          {categories && categories.length > 0 && (
            <CategoryGrid categories={categories} locale={locale} />
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
      </section>
    </main>
  );
}

