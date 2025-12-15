import Image from 'next/image';
import Link from 'next/link';
import { User, Calendar, MessageSquare } from 'lucide-react';
import { getBilingualText } from '@/lib/locale';
import type { DoctorResponse } from '@/lib/api';
import { normalizeImageUrl } from '@/lib/image-utils';

interface AuthorCardProps {
  author: DoctorResponse;
  locale: 'uz' | 'ru';
}

export default function AuthorCard({ author, locale }: AuthorCardProps) {
  const name = getBilingualText(author.name_uz, author.name_ru, locale);
  const position = getBilingualText(author.position_uz, author.position_ru, locale);
  const experience = getBilingualText(author.experience_uz, author.experience_ru, locale);
  const imageUrl = author.image?.url ? normalizeImageUrl(author.image.url) : null;

  return (
    <div className="mt-8 rounded-lg border border-border bg-muted/30 p-6">
      {/* Header */}
      <div className="mb-4">
        <p className="text-sm font-medium text-muted-foreground">
          {locale === 'ru' ? 'Этот материал для Вас подготовила:' : 'Ushbu material siz uchun tayyorlangan:'}
        </p>
      </div>

      {/* Author Info - Compact Layout */}
      <div className="flex gap-4">
        {/* Author Image - Small */}
        <div className="flex-shrink-0">
          {imageUrl ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-white border border-border/40">
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 border border-border/40">
              <User className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Author Details - Compact */}
        <div className="flex-1 min-w-0">
          <h3 className="mb-1 text-lg font-bold text-foreground">{name}</h3>
          
          {position && (
            <p className="mb-1 text-sm text-muted-foreground">
              {position}
            </p>
          )}

          {experience && (
            <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{experience}</span>
            </div>
          )}

          {/* Action Buttons - Compact */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="#appointment"
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-accent"
            >
              <Calendar className="h-3.5 w-3.5" />
              {locale === 'ru' ? 'Записаться на прием' : 'Qabulga yozilish'}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {locale === 'ru' ? 'Задать вопрос' : 'Savol berish'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}









