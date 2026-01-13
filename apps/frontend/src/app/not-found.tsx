import Link from 'next/link';
import { detectLocale } from '@/lib/locale-server';

export default function NotFound() {
  const locale = detectLocale();
  
  const texts = {
    uz: {
      title: 'Sahifa topilmadi',
      description: 'Kechirasiz, siz qidirayotgan sahifa mavjud emas.',
      backHome: 'Bosh sahifaga qaytish',
    },
    ru: {
      title: 'Страница не найдена',
      description: 'Извините, страница, которую вы ищете, не существует.',
      backHome: 'Вернуться на главную',
    },
  };
  
  const t = texts[locale];
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-brand-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-600 mb-8">{t.description}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          {t.backHome}
        </Link>
      </div>
    </div>
  );
}

