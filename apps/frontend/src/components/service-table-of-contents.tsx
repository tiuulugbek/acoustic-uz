'use client';

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

interface ServiceTableOfContentsProps {
  items: TableOfContentsItem[];
  locale: 'uz' | 'ru';
}

export default function ServiceTableOfContents({ items, locale }: ServiceTableOfContentsProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        {locale === 'ru' ? 'В этой статье' : 'Ushbu maqolada'}
      </h3>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={`block text-sm transition-colors hover:text-brand-primary ${
                  item.level === 3 ? 'ml-4 text-muted-foreground' : 'font-medium text-foreground'
                }`}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          {locale === 'ru' ? 'Содержание будет добавлено' : 'Mundarija qo\'shiladi'}
        </p>
      )}
    </div>
  );
}

