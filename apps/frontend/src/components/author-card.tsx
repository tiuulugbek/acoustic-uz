'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Calendar, MessageSquare, X } from 'lucide-react';
import { getBilingualText } from '@/lib/locale';
import type { DoctorResponse } from '@/lib/api';
import { normalizeImageUrl } from '@/lib/image-utils';
import AppointmentForm from './appointment-form';

interface AuthorCardProps {
  author: DoctorResponse;
  locale: 'uz' | 'ru';
  source?: string; // Source identifier (e.g., 'post-{slug}')
}

export default function AuthorCard({ author, locale, source }: AuthorCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const name = getBilingualText(author.name_uz, author.name_ru, locale);
  const position = getBilingualText(author.position_uz, author.position_ru, locale);
  const experience = getBilingualText(author.experience_uz, author.experience_ru, locale);
  const imageUrl = author.image?.url ? normalizeImageUrl(author.image.url) : null;

  const handleAppointmentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isModalOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleModalClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="mt-8 rounded-lg border border-border bg-white p-6 shadow-sm">
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
              <button
                onClick={handleAppointmentClick}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-accent"
              >
                <Calendar className="h-3.5 w-3.5" />
                {locale === 'ru' ? 'Записаться на прием' : 'Qabulga yozilish'}
              </button>
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

      {/* Appointment Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleModalClose}
        >
          <div 
            className="relative w-full max-w-md rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                {locale === 'ru' ? 'Записаться на прием' : 'Qabulga yozilish'}
              </h2>
              <button
                onClick={handleModalClose}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={locale === 'ru' ? 'Закрыть' : 'Yopish'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4">
              {/* Doctor Info */}
              <div className="mb-4 flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                {imageUrl ? (
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={imageUrl}
                      alt={name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
                    <User className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  {position && (
                    <p className="text-xs text-muted-foreground">{position}</p>
                  )}
                </div>
              </div>

              {/* Appointment Form */}
              <AppointmentForm 
                locale={locale} 
                doctorId={author.id}
                doctorName={name}
                source={source || `author-card-${author.slug || author.id}`}
                onSuccess={handleModalClose}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}









