import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import { getBilingualText } from '@/lib/locale';
import type { PostResponse } from '@/lib/api';

interface PostSidebarProps {
  locale: 'uz' | 'ru';
  relatedPosts: PostResponse[];
}

export default function PostSidebar({ locale, relatedPosts }: PostSidebarProps) {
  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
        <FileText className="h-5 w-5 text-brand-primary" />
        {locale === 'ru' ? 'Полезные статьи' : 'Foydali maqolalar'}
      </h3>
      <ul className="space-y-3">
        {relatedPosts.slice(0, 5).map((post) => {
          const postTitle = getBilingualText(post.title_uz, post.title_ru, locale);
          return (
            <li key={post.id}>
              <Link
                href={`/posts/${post.slug}`}
                className="group flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
              >
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-brand-primary" />
                <span className="text-sm leading-relaxed text-foreground group-hover:text-brand-primary transition-colors line-clamp-2">
                  {postTitle}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

