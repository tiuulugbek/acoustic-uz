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
        <div className="mx-auto max-w-6xl px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white md:px-6">
          {breadcrumbs.map((crumb, index) => (
            <span key={index}>
              {index > 0 && <span className="mx-2">›</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-white/80 text-white/70" suppressHydrationWarning>
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-white" suppressHydrationWarning>{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}

