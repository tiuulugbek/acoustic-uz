import Link from 'next/link';
import Image from 'next/image';
import { getBilingualText } from '@/lib/locale';
import type { PostResponse, BranchResponse } from '@/lib/api';
import { Calendar } from 'lucide-react';
import PostsSidebar from './posts-sidebar';
import { getBranches } from '@/lib/api-server';

interface PostsListProps {
  posts: PostResponse[];
  locale: 'uz' | 'ru';
  layout?: 'grid' | 'two-column';
}

async function PostsListWithSidebar({ posts, locale }: { posts: PostResponse[]; locale: 'uz' | 'ru' }) {
  const branches = await getBranches(locale);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main content area - 2 columns */}
      <div className="lg:col-span-2">
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => {
            const title = getBilingualText(post.title_uz, post.title_ru, locale);
            const excerpt = getBilingualText(post.excerpt_uz, post.excerpt_ru, locale) || 
                           getBilingualText(post.body_uz, post.body_ru, locale)?.replace(/<[^>]*>/g, '').substring(0, 120) + '...';
            const coverUrl = post.cover?.url;

            return (
              <article
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {coverUrl && (
                  <Link href={`/posts/${post.slug}`} className="relative aspect-video w-full overflow-hidden bg-muted">
                    <Image
                      src={coverUrl}
                      alt={title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </Link>
                )}
                {!coverUrl && (
                  <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-3 text-xl font-semibold leading-tight text-foreground line-clamp-2">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="transition-colors hover:text-brand-primary"
                    >
                      {title}
                    </Link>
                  </h3>
                  {excerpt && (
                    <p className="mb-0 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {excerpt}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Sidebar with maps and reviews */}
      <div className="lg:col-span-1">
        <PostsSidebar locale={locale} branches={branches || []} />
      </div>
    </div>
  );
}

export default function PostsList({ posts, locale, layout = 'grid' }: PostsListProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {locale === 'ru'
            ? 'Статьи скоро будут добавлены.'
            : "Maqolalar tez orada qo'shiladi."}
        </p>
      </div>
    );
  }

  if (layout === 'two-column') {
    // Two column layout: main articles on left, sidebar on right
    const mainPosts = posts; // All posts in main area

    return (
      <PostsListWithSidebar posts={mainPosts} locale={locale} />
    );
  }

  // Default grid layout
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => {
        const title = getBilingualText(post.title_uz, post.title_ru, locale);
        const excerpt = getBilingualText(post.excerpt_uz, post.excerpt_ru, locale) || 
                       getBilingualText(post.body_uz, post.body_ru, locale)?.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
        const coverUrl = post.cover?.url;

        return (
          <article
            key={post.id}
            className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {coverUrl && (
              <Link href={`/posts/${post.slug}`} className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={coverUrl}
                  alt={title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </Link>
            )}
            <div className="flex flex-1 flex-col p-6">
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <time dateTime={post.publishAt}>
                  {new Date(post.publishAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </time>
              </div>
              <h3 className="mb-2 text-lg font-semibold leading-tight text-foreground">
                <Link
                  href={`/posts/${post.slug}`}
                  className="transition-colors hover:text-brand-primary"
                >
                  {title}
                </Link>
              </h3>
              {excerpt && (
                <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">
                  {excerpt}
                </p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <Link
                href={`/posts/${post.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary transition-colors hover:text-brand-accent"
              >
                {locale === 'ru' ? 'Читать далее' : "Ko'proq o'qish"}
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
