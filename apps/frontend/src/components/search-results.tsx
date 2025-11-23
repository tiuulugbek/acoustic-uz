'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { getBilingualText } from '@/lib/locale';
import { search } from '@/lib/api';
import type { SearchResponse } from '@/lib/api';

interface SearchResultsProps {
  query: string;
  locale: 'uz' | 'ru';
}

export default function SearchResults({ query, locale }: SearchResultsProps) {
  const { data, isLoading } = useQuery<SearchResponse>({
    queryKey: ['search', query],
    queryFn: () => search(query, locale),
    enabled: !!query && query.trim().length > 0,
  });

  if (!query || query.trim().length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          {locale === 'ru' ? 'Введите поисковый запрос' : 'Qidiruv so\'rovini kiriting'}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {locale === 'ru' ? 'Поиск...' : 'Qidirilmoqda...'}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {locale === 'ru' ? 'Ошибка при поиске' : 'Qidiruvda xatolik'}
        </p>
      </div>
    );
  }

  const { products = [], services = [], posts = [] } = data;
  const totalResults = products.length + services.length + posts.length;

  if (totalResults === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-2">
          {locale === 'ru' ? 'Ничего не найдено' : 'Hech narsa topilmadi'}
        </p>
        <p className="text-muted-foreground text-sm">
          {locale === 'ru' 
            ? `По запросу "${query}" ничего не найдено`
            : `"${query}" so'rovi bo'yicha hech narsa topilmadi`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Results Summary */}
      <div>
        <p className="text-sm text-muted-foreground">
          {locale === 'ru' 
            ? `Найдено результатов: ${totalResults}`
            : `Topilgan natijalar: ${totalResults}`}
        </p>
      </div>

      {/* Products */}
      {products.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">
            {locale === 'ru' ? 'Товары' : 'Mahsulotlar'} ({products.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const title = getBilingualText(product.name_uz, product.name_ru, locale);
              const description = getBilingualText(product.description_uz, product.description_ru, locale);
              const imageUrl = product.galleryUrls?.[0] || product.brand?.logo?.url || '';
              
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {imageUrl && (
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
                      <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-brand-primary transition-colors line-clamp-2">
                      {title}
                    </h3>
                    {description && (
                      <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">
                        {description}
                      </p>
                    )}
                    {product.brand && (
                      <p className="text-xs text-muted-foreground">
                        {product.brand.name}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">
            {locale === 'ru' ? 'Услуги' : 'Xizmatlar'} ({services.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const title = getBilingualText(service.title_uz, service.title_ru, locale);
              const excerpt = getBilingualText(service.excerpt_uz, service.excerpt_ru, locale);
              const imageUrl = service.cover?.url || '';
              
              return (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {imageUrl && (
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
                      <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-brand-primary transition-colors line-clamp-2">
                      {title}
                    </h3>
                    {excerpt && (
                      <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">
                        {excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Posts */}
      {posts.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">
            {locale === 'ru' ? 'Статьи' : 'Maqolalar'} ({posts.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const title = getBilingualText(post.title_uz, post.title_ru, locale);
              const excerpt = getBilingualText(post.excerpt_uz, post.excerpt_ru, locale);
              const imageUrl = post.cover?.url || '';
              
              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {imageUrl && (
                    <div className="relative aspect-video w-full overflow-hidden bg-muted/20">
                      <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-brand-primary transition-colors line-clamp-2">
                      {title}
                    </h3>
                    {excerpt && (
                      <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">
                        {excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

