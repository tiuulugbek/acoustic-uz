import Image from 'next/image';
import Link from 'next/link';
import { User, Calendar, MapPin, MessageSquare } from 'lucide-react';
import { getBilingualText } from '@/lib/locale';
import type { DoctorResponse } from '@/lib/api';
import AppointmentForm from './appointment-form';

interface AuthorCardProps {
  author: DoctorResponse;
  locale: 'uz' | 'ru';
}

export default function AuthorCard({ author, locale }: AuthorCardProps) {
  const name = getBilingualText(author.name_uz, author.name_ru, locale);
  const position = getBilingualText(author.position_uz, author.position_ru, locale);
  const experience = getBilingualText(author.experience_uz, author.experience_ru, locale);
  const description = getBilingualText(author.description_uz, author.description_ru, locale);
  const imageUrl = author.image?.url;

  return (
    <div className="mt-12 rounded-lg border border-border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 rounded-md bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 px-4 py-2">
        <p className="text-sm font-medium text-muted-foreground">
          {locale === 'ru' ? 'Этот материал для Вас подготовила:' : 'Ushbu material siz uchun tayyorlangan:'}
        </p>
      </div>

      {/* Author Info */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Author Image */}
        <div className="flex-shrink-0">
          {imageUrl ? (
            <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-muted">
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary/10 to-brand-accent/10">
              <User className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Author Details */}
        <div className="flex-1">
          <h3 className="mb-2 text-xl font-bold text-foreground">{name}</h3>
          
          {position && (
            <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
              {position}
            </p>
          )}

          {experience && (
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{experience}</span>
            </div>
          )}

          {description && (
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="#appointment"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-accent"
            >
              <Calendar className="h-4 w-4" />
              {locale === 'ru' ? 'Записаться на прием' : 'Qabulga yozilish'}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <MessageSquare className="h-4 w-4" />
              {locale === 'ru' ? 'Задать вопрос' : 'Savol berish'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}




