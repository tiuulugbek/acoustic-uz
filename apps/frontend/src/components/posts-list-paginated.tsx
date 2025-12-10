'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getBilingualText } from '@/lib/locale';
import { normalizeImageUrl } from '@/lib/image-utils';
import type { PostResponse } from '@/lib/api';
import { Calendar } from 'lucide-react';

interface PostsListPaginatedProps {
  posts: PostResponse[];
  locale: 'uz' | 'ru';
  postsPerPage?: number;
}

export default function PostsListPaginated({ posts, locale, postsPerPage = 6 }: PostsListPaginatedProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
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

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = posts.slice(startIndex, endIndex);

  return (
    <div>
      {/* Posts Grid - 2 columns on mobile, 3 on desktop */}
      <div className="grid gap-4 grid-cols-2 md:gap-6 lg:grid-cols-3">
        {currentPosts.map((post) => {
          const title = getBilingualText(post.title_uz, post.title_ru, locale);
          const excerpt = getBilingualText(post.excerpt_uz, post.excerpt_ru, locale) || 
                         getBilingualText(post.body_uz, post.body_ru, locale)?.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
          const coverUrl = post.cover?.url ? normalizeImageUrl(post.cover.url) : null;

          return (
            <article
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {coverUrl ? (
                <Link href={`/posts/${post.slug}`} className="relative aspect-video w-full overflow-hidden bg-muted">
                  <Image
                    src={coverUrl}
                    alt={title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </Link>
              ) : (
                <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 flex items-center justify-center">
                  <Calendar className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground/30" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-3 md:p-4 lg:p-6">
                <h3 className="mb-2 text-sm md:text-base lg:text-lg font-semibold leading-tight text-foreground line-clamp-2">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="transition-colors hover:text-brand-primary"
                  >
                    {title}
                  </Link>
                </h3>
                {excerpt && (
                  <p className="mb-2 flex-1 text-xs md:text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">
                    {excerpt}
                  </p>
                )}
                <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <time dateTime={post.publishAt}>
                    {new Date(post.publishAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </time>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {locale === 'ru' ? 'Назад' : 'Oldingi'}
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === page
                        ? 'bg-brand-primary text-white'
                        : 'text-foreground bg-white border border-border hover:bg-muted'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return <span key={page} className="px-2 text-muted-foreground">...</span>;
              }
              return null;
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {locale === 'ru' ? 'Вперед' : 'Keyingi'}
          </button>
        </div>
      )}
    </div>
  );
}

