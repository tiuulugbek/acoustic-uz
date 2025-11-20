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
      <section className="bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:px-6">
          {breadcrumbs.map((crumb, index) => (
            <span key={index}>
              {index > 0 && <span className="mx-2">›</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-brand-primary" suppressHydrationWarning>
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-brand-primary" suppressHydrationWarning>{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      </section>

      {/* Header Section */}
      <section className="bg-brand-accent text-white">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <h1 className="text-xl font-bold md:text-2xl" suppressHydrationWarning>
                {title}
              </h1>
              {description && (
                <p className="max-w-4xl text-sm leading-relaxed text-white/90" suppressHydrationWarning>
                  {description}
                </p>
              )}
            </div>
            {icon && (
              <div className="hidden md:block relative w-12 h-12 flex-shrink-0">
                <div className="absolute inset-0 bg-white/10 rounded-lg flex items-center justify-center">
                  {icon}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

