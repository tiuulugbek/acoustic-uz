import Link from 'next/link';
import { MapPin } from 'lucide-react';

interface PageHeaderProps {
  locale: 'uz' | 'ru';
  breadcrumbs: Array<{ label: string; href?: string }>;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function PageHeader({ locale, breadcrumbs, title, description, icon }: PageHeaderProps) {
  return (
    <>
      {/* Breadcrumbs */}
      <section className="bg-[hsl(var(--secondary))]">
        <div className="mx-auto max-w-6xl px-4 py-2 sm:py-3 text-xs font-semibold uppercase tracking-wide text-white sm:px-6">
          <div className="flex flex-wrap items-center gap-x-2">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center">
                {index > 0 && <span className="mx-1 sm:mx-2">›</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-white/80 text-white/70 break-words" suppressHydrationWarning>
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white break-words" suppressHydrationWarning>{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>
      
      {/* Title and Description */}
      {(title || description) && (
        <section className="bg-[hsl(var(--secondary))] border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6 sm:px-6">
            <div className="flex items-start gap-3 sm:gap-4">
              {icon && (
                <div className="flex-shrink-0 mt-1">
                  {icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 break-words" suppressHydrationWarning>
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-sm sm:text-base text-white/90 leading-relaxed break-words" suppressHydrationWarning>
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

