import { Metadata } from 'next';
import PanoramaViewer from '@/components/tour/PanoramaViewer';
import { detectLocale } from '@/lib/locale-server';
import type { TourConfig } from '@/types/tour';
// ISR: Revalidate every hour
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = detectLocale();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  
  const title = locale === 'ru' 
    ? 'Виртуальный тур — Acoustic.uz' 
    : 'Virtual tur — Acoustic.uz';
  
  return {
    title,
    description: locale === 'ru'
      ? '3D виртуальный тур по нашему центру'
      : '3D virtual tur - bizning markazimizni ko\'ring',
    alternates: {
      canonical: `${baseUrl}/tour`,
    },
  };
}

async function loadTourConfig(): Promise<TourConfig | null> {
  try {
    // Load config from public directory
    // In production, this could be loaded from API or database
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/tour-config.json`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error('Config file not found');
    }
    
    return await response.json() as TourConfig;
  } catch (error) {
    console.error('Error loading tour config:', error);
    // Return default config if file doesn't exist
    return {
      default: {
        firstScene: 'room1',
        hfov: 100,
        pitch: 0,
        yaw: 0,
      },
      scenes: {
        room1: {
          id: 'room1',
          panorama: '/panorama/room1.jpg',
          type: 'equirectangular',
          hfov: 100,
          pitch: 0,
          yaw: 0,
          title: {
            uz: 'Asosiy xona',
            ru: 'Главный зал',
          },
          hotSpots: [],
          order: 1,
        },
      },
      autoRotate: 0,
      autoLoad: true,
      showControls: true,
      showFullscreenCtrl: true,
      showZoomCtrl: true,
      keyboardZoom: true,
      mouseZoom: true,
      compass: false,
      northOffset: 0,
    };
  }
}

export default async function TourPage() {
  const locale = detectLocale();
  const config = await loadTourConfig();

  if (!config) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {locale === 'ru' ? 'Тур не настроен' : 'Tur sozlanmagan'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'ru' 
              ? 'Пожалуйста, настройте конфигурацию тура.' 
              : 'Iltimos, tur konfiguratsiyasini sozlang.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              {locale === 'ru' ? 'Виртуальный тур' : 'Virtual tur'}
            </h1>
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-brand-primary transition-colors"
            >
              {locale === 'ru' ? '← На главную' : '← Bosh sahifaga'}
            </a>
          </div>
        </div>
      </div>

      {/* Panorama Viewer */}
      <PanoramaViewer config={config} locale={locale} />
    </main>
  );
}

