import type { Metadata } from 'next';
import { getPageBySlug, getPosts } from '@/lib/api-server';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';
import PageHeader from '@/components/page-header';
import ServiceContent from '@/components/service-content';
import PostsList from '@/components/posts-list';
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
  const page = await getPageBySlug('patients', locale);
  // Get posts for 'bemorlar' category by slug
  // We'll use the category slug 'bemorlar' - backend will handle it
  const bemorlarCategoryId = 'cmi8uhl5t0000x9s3mf4y07h2'; // Bemorlar category ID from database
  const posts = await getPosts(locale, true, bemorlarCategoryId, 'article');

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
          
          {posts && posts.length > 0 && (
            <div>
              <PostsList posts={posts} locale={locale} layout="two-column" />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

