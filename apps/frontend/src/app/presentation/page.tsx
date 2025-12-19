'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Smartphone, 
  Users, 
  MapPin, 
  BarChart3, 
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Star,
  MessageSquare,
  Calendar,
  Search,
  ShoppingCart,
  Heart,
  Eye,
  Zap,
  Shield,
  Clock,
  Target,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Phone
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getDoctors, getBranches, getSettings } from '@/lib/api';
import type { DoctorResponse, BranchResponse, SettingsResponse } from '@/lib/api';
import { normalizeImageUrl } from '@/lib/image-utils';
import PresentationLock from './lock';

interface Slide {
  id: string;
  title: string;
  titleRu: string;
  content: React.ReactNode;
  contentRu: React.ReactNode;
}

// Mobile Demo Component - 3 phones side by side with real website pages
function MobileDemo({ settings, locale }: { settings: SettingsResponse | null; locale: 'uz' | 'ru' }) {
  const iframeRefs = [
    useRef<HTMLIFrameElement>(null),
    useRef<HTMLIFrameElement>(null),
    useRef<HTMLIFrameElement>(null),
  ];
  const scrollRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];
  const [baseUrl, setBaseUrl] = useState<string>('');

  useEffect(() => {
    // Get base URL from environment or current location
    const url = process.env.NEXT_PUBLIC_SITE_URL || 
                (typeof window !== 'undefined' ? window.location.origin : 'https://acoustic.uz');
    setBaseUrl(url);
  }, []);

  // Auto scroll removed - users can scroll manually

  const mobileScreens = [
    {
      title: 'Filiallar',
      url: '/branches',
    },
    {
      title: 'Mutaxassislar',
      url: '/doctors',
    },
    {
      title: 'Eshitish moslamalari',
      url: '/catalog?productType=hearing-aids',
    },
  ];

  return (
    <div className="relative w-full">
      <div className="flex justify-center items-start gap-6 flex-wrap">
        {mobileScreens.map((screen, index) => (
          <div key={index} className="relative">
            {/* iPhone Frame - Realistic proportions */}
            <div className="relative w-[280px] h-[600px]">
              {/* iPhone Outer Frame */}
              <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-800 to-gray-900 rounded-[3rem] p-2 shadow-2xl">
                {/* Screen Bezel */}
                <div className="w-full h-full bg-black rounded-[2.5rem] p-1">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10"></div>
                  {/* Screen */}
                  <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-white flex items-center justify-between px-4 text-xs font-medium z-20">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 border border-black rounded-sm">
                          <div className="w-3 h-1.5 bg-black rounded-sm m-0.5"></div>
                        </div>
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Scrollable container for iframe */}
                    <div
                      ref={scrollRefs[index]}
                      className="h-full overflow-y-auto pt-8 relative"
                      style={{ 
                        scrollBehavior: 'smooth',
                        overscrollBehavior: 'contain',
                        touchAction: 'pan-y',
                        WebkitOverflowScrolling: 'touch'
                      }}
                    >
                      <iframe
                        ref={iframeRefs[index]}
                        src={`${baseUrl}${screen.url}`}
                        className="border-0"
                        style={{
                          width: '390px',
                          height: '844px',
                          transform: 'scale(0.7)',
                          transformOrigin: 'top left',
                          pointerEvents: 'auto', // Enable interaction
                          display: 'block',
                        }}
                        sandbox="allow-same-origin allow-scripts allow-forms"
                        loading="lazy"
                        title={screen.title}
                      />
                      {/* Extra space for scrolling */}
                      <div style={{ height: '250px' }}></div>
                    </div>
                    
                    {/* Sticky Header Overlay with Phone and CTA - Real website style */}
                    <div className="absolute top-8 left-0 right-0 z-30 pointer-events-none">
                      <div className="sticky top-0 bg-white/98 backdrop-blur-md border-b border-gray-200 shadow-sm px-3 py-2 flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-gray-800">{screen.title}</h3>
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${settings?.phoneSecondary?.replace(/\s/g, '') || '+998712021441'}`}
                            className="inline-flex items-center gap-1 rounded-full border border-[#F07E22]/30 bg-[#F07E22] px-2.5 py-1 text-[10px] font-semibold text-white shadow transition hover:bg-[#F07E22]/90 pointer-events-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Phone size={10} /> {settings?.phonePrimary || '1385'}
                          </a>
                          <Link
                            href="/contact"
                            className="inline-flex items-center gap-1 rounded-full border border-[#3F3091]/30 bg-[#3F3091] px-2.5 py-1 text-[10px] font-semibold text-white shadow transition hover:bg-[#3F3091]/90 pointer-events-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <MessageSquare size={10} />
                            {locale === 'uz' ? 'Qabulga yozilish' : 'Записаться'}
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    {/* Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Interaction indicator */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#3F3091] text-white rounded-full text-sm font-medium">
          <Smartphone className="h-4 w-4" />
          <span>{locale === 'uz' ? 'Bosib scroll qiling va sahifalarni ko\'ring' : 'Прокрутите и просмотрите страницы'}</span>
        </div>
      </div>
    </div>
  );
}

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [locale, setLocale] = useState<'uz' | 'ru'>('uz');
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [doctorsData, branchesData, settingsData] = await Promise.all([
          getDoctors(locale),
          getBranches(locale),
          getSettings(locale),
        ]);
        setDoctors(doctorsData || []);
        setBranches(branchesData || []);
        setSettings(settingsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, [locale]);

  useEffect(() => {
    if (isAutoPlay) {
      autoPlayIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    } else {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    }
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [isAutoPlay]);

  useEffect(() => {
    slideRefs.current[currentSlide]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentSlide]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const slides: Slide[] = [
    {
      id: 'intro',
      title: 'Acoustic.uz — raqamli transformatsiya',
      titleRu: 'Acoustic.uz — цифровая трансформация',
      content: (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-[#F07E22] to-[#3F3091] bg-clip-text text-transparent">
              Acoustic.uz
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Eshitish markazining raqamli yuzi
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-[#F07E22]/10 to-[#3F3091]/10">
              <Globe className="h-12 w-12 mx-auto mb-4 text-[#F07E22]" />
              <h3 className="text-xl font-semibold mb-2">24/7 Onlayn</h3>
              <p className="text-muted-foreground">Har qanday vaqtda, har qanday joydan kirish</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-[#3F3091]/10 to-[#F07E22]/10">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-[#3F3091]" />
              <h3 className="text-xl font-semibold mb-2">Mobil optimizatsiya</h3>
              <p className="text-muted-foreground">Barcha qurilmalarda mukammal ishlash</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-[#F07E22]/10 to-[#3F3091]/10">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-[#F07E22]" />
              <h3 className="text-xl font-semibold mb-2">Marketing kuch</h3>
              <p className="text-muted-foreground">Mijozlar oqimini oshirish va konversiyani yaxshilash</p>
            </div>
          </div>
        </div>
      ),
      contentRu: (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-[#F07E22] to-[#3F3091] bg-clip-text text-transparent">
              Acoustic.uz
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Цифровое лицо центра слуха
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-[#F07E22]/10 to-[#3F3091]/10">
              <Globe className="h-12 w-12 mx-auto mb-4 text-[#F07E22]" />
              <h3 className="text-xl font-semibold mb-2">24/7 Онлайн</h3>
              <p className="text-muted-foreground">Доступ в любое время, из любого места</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-[#3F3091]/10 to-[#F07E22]/10">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-[#3F3091]" />
              <h3 className="text-xl font-semibold mb-2">Мобильная Оптимизация</h3>
              <p className="text-muted-foreground">Идеальная работа на всех устройствах</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-[#F07E22]/10 to-[#3F3091]/10">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-[#F07E22]" />
              <h3 className="text-xl font-semibold mb-2">Маркетинговая Сила</h3>
              <p className="text-muted-foreground">Увеличение потока клиентов и улучшение конверсии</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'marketing',
      title: 'Marketing nuqtai nazaridan saytning ahamiyati',
      titleRu: 'Важность сайта с точки зрения маркетинга',
      content: (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-gradient-to-br from-[#F07E22]/10 to-white border border-[#F07E22]/20">
                <BarChart3 className="h-8 w-8 text-[#F07E22] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Statistikalar va analitika</h3>
                  <p className="text-muted-foreground">
                    Har bir mijoz oqimi, sahifa ko'rish va konversiya to'g'risida batafsil ma'lumot. 
                    Qaysi sahifalar eng ko'p natija berayotganini aniqlash.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-gradient-to-br from-[#3F3091]/10 to-white border border-[#3F3091]/20">
                <Target className="h-8 w-8 text-[#3F3091] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Maqsadli marketing</h3>
                  <p className="text-muted-foreground">
                    Har bir sahifa va bo'lim uchun alohida tracking. Qaysi manbadan 
                    eng ko'p mijoz kelayotganini aniqlash va marketing byudjetini optimallashtirish.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-gradient-to-br from-[#F07E22]/10 to-white border border-[#F07E22]/20">
                <TrendingUp className="h-8 w-8 text-[#F07E22] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Konversiya optimizatsiyasi</h3>
                  <p className="text-muted-foreground">
                    Onlayn yozilish formalari, telefon qo'ng'iroqlari va chat integratsiyalari. 
                    Har bir mijoz oqimini kuzatish va konversiya darajasini oshirish.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-gradient-to-br from-[#3F3091]/10 to-white border border-[#3F3091]/20">
                <Eye className="h-8 w-8 text-[#3F3091] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">SEO va ko'rinish</h3>
                  <p className="text-muted-foreground">
                    Google va boshqa qidiruv tizimlarida yuqori pozitsiyalar. 
                    Potentsial mijozlar sizni topishlari osonlashadi.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 p-6 rounded-lg bg-[#F07E22] text-white">
            <h3 className="text-2xl font-bold mb-4">Marketing natijalari</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">24/7</div>
                <div className="text-sm opacity-90">Doimiy kirish</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">100%</div>
                <div className="text-sm opacity-90">Tracking</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">∞</div>
                <div className="text-sm opacity-90">Cheksiz potensial</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">0</div>
                <div className="text-sm opacity-90">Qo'shimcha xarajat</div>
              </div>
            </div>
          </div>
        </div>
      ),
      contentRu: (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-gradient-to-br from-[#F07E22]/10 to-white border border-[#F07E22]/20">
                <BarChart3 className="h-8 w-8 text-[#F07E22] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Статистика и Аналитика</h3>
                  <p className="text-muted-foreground">
                    Подробная информация о каждом потоке клиентов, просмотрах страниц и конверсии. 
                    Определение, какие страницы дают наибольший результат.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-gradient-to-br from-[#3F3091]/10 to-white border border-[#3F3091]/20">
                <Target className="h-8 w-8 text-[#3F3091] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Целевой Маркетинг</h3>
                  <p className="text-muted-foreground">
                    Отдельное отслеживание для каждой страницы и раздела. Определение, 
                    откуда приходит больше всего клиентов, и оптимизация маркетингового бюджета.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-gradient-to-br from-[#F07E22]/10 to-white border border-[#F07E22]/20">
                <TrendingUp className="h-8 w-8 text-[#F07E22] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Оптимизация Конверсии</h3>
                  <p className="text-muted-foreground">
                    Онлайн формы записи, телефонные звонки и интеграции чатов. 
                    Отслеживание каждого потока клиентов и повышение уровня конверсии.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-gradient-to-br from-[#3F3091]/10 to-white border border-[#3F3091]/20">
                <Eye className="h-8 w-8 text-[#3F3091] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">SEO и Видимость</h3>
                  <p className="text-muted-foreground">
                    Высокие позиции в Google и других поисковых системах. 
                    Потенциальным клиентам будет легче вас найти.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-[#F07E22] to-[#3F3091] text-white">
            <h3 className="text-2xl font-bold mb-4">Маркетинговые Результаты</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">24/7</div>
                <div className="text-sm opacity-90">Постоянный доступ</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">100%</div>
                <div className="text-sm opacity-90">Отслеживание</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">∞</div>
                <div className="text-sm opacity-90">Безграничный потенциал</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">0</div>
                <div className="text-sm opacity-90">Дополнительных расходов</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'doctors',
      title: 'Mutaxassislar kartochkalari — ishonch va professionalizm',
      titleRu: 'Карточки специалистов — доверие и профессионализм',
      content: (
        <div className="space-y-8">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Nima uchun mutaxassislar kartochkalari muhim?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Mijozlar mutaxassislarni ko'rish va tanlash imkoniyatiga ega bo'lishadi
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-white border-2 border-[#F07E22]/30 shadow-lg">
                <Users className="h-8 w-8 text-[#F07E22] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ishonch oshirish</h3>
                  <p className="text-muted-foreground">
                    Mijozlar mutaxassisning fotosurati, tajribasi va malakasini ko'rishadi. 
                    Bu ishonchni oshiradi va qaror qabul qilishni osonlashtiradi.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-white border-2 border-[#3F3091]/30 shadow-lg">
                <Star className="h-8 w-8 text-[#3F3091] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Professional ko'rinish</h3>
                  <p className="text-muted-foreground">
                    Har bir mutaxassisning batafsil profili, kasbiy yutuqlari va 
                    mutaxassislik sohalari ko'rsatiladi.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-white border-2 border-[#F07E22]/30 shadow-lg">
                <Calendar className="h-8 w-8 text-[#F07E22] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">To'g'ridan-to'g'ri yozilish</h3>
                  <p className="text-muted-foreground">
                    Har bir mutaxassis kartochkasidan to'g'ridan-to'g'ri qabulga yozilish mumkin. 
                    Bu konversiyani sezilarli darajada oshiradi.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-white border-2 border-[#3F3091]/30 shadow-lg">
                <MessageSquare className="h-8 w-8 text-[#3F3091] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Aloqa qulayligi</h3>
                  <p className="text-muted-foreground">
                    Mijozlar mutaxassis bilan aloqa qilish va savollar berish imkoniyatiga ega. 
                    Bu mijozlar bilan aloqani yaxshilaydi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {doctors.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Bizning mutaxassislarimiz</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {doctors.slice(0, 3).map((doctor) => {
                  const name = locale === 'ru' ? doctor.name_ru : doctor.name_uz;
                  const position = locale === 'ru' ? doctor.position_ru : doctor.position_uz;
                  const imageUrl = doctor.image?.url ? normalizeImageUrl(doctor.image.url) : null;
                  
                  return (
                    <div 
                      key={doctor.id}
                      className="group relative overflow-hidden rounded-lg bg-white border-2 border-border shadow-lg transition-all hover:shadow-xl hover:scale-105"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-[#F07E22]/20 to-[#3F3091]/20">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Users className="h-16 w-16 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h4 className="text-lg font-bold mb-2">{name}</h4>
                        {position && (
                          <p className="text-sm text-[#3F3091] font-medium mb-3">{position}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>Professional mutaxassis</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ),
      contentRu: (
        <div className="space-y-8">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Почему важны карточки специалистов?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Клиенты получают возможность видеть и выбирать врачей
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-white border-2 border-[#F07E22]/30 shadow-lg">
                <Users className="h-8 w-8 text-[#F07E22] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Повышение Доверия</h3>
                  <p className="text-muted-foreground">
                    Клиенты видят фото врача, его опыт и квалификацию. 
                    Это повышает доверие и облегчает принятие решения.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-white border-2 border-[#3F3091]/30 shadow-lg">
                <Star className="h-8 w-8 text-[#3F3091] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Профессиональный Вид</h3>
                  <p className="text-muted-foreground">
                    Показан подробный профиль каждого специалиста, его профессиональные достижения 
                    и области специализации.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-white border-2 border-[#F07E22]/30 shadow-lg">
                <Calendar className="h-8 w-8 text-[#F07E22] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Прямая Запись</h3>
                  <p className="text-muted-foreground">
                    С карточки каждого врача можно записаться напрямую. 
                    Это значительно повышает конверсию.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-white border-2 border-[#3F3091]/30 shadow-lg">
                <MessageSquare className="h-8 w-8 text-[#3F3091] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Удобство Связи</h3>
                  <p className="text-muted-foreground">
                    Клиенты могут связаться с врачом и задать вопросы. 
                    Это улучшает взаимодействие с клиентами.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {doctors.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Наши Специалисты</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {doctors.slice(0, 3).map((doctor) => {
                  const name = locale === 'ru' ? doctor.name_ru : doctor.name_uz;
                  const position = locale === 'ru' ? doctor.position_ru : doctor.position_uz;
                  const imageUrl = doctor.image?.url ? normalizeImageUrl(doctor.image.url) : null;
                  
                  return (
                    <div 
                      key={doctor.id}
                      className="group relative overflow-hidden rounded-lg bg-white border-2 border-border shadow-lg transition-all hover:shadow-xl hover:scale-105"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-[#F07E22]/20 to-[#3F3091]/20">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Users className="h-16 w-16 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h4 className="text-lg font-bold mb-2">{name}</h4>
                        {position && (
                          <p className="text-sm text-[#3F3091] font-medium mb-3">{position}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>Профессиональный специалист</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'branches',
      title: 'Filiallar bo\'limi — geografik qamrov va qulaylik',
      titleRu: 'Раздел филиалов — географический охват и удобство',
      content: (
        <div className="space-y-8">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Filiallar bo'limi nima uchun muhim?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Mijozlar eng yaqin filialni topish va u yerga qanday borishni bilishadi
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-white border-2 border-[#F07E22]/30 shadow-lg">
                <MapPin className="h-8 w-8 text-[#F07E22] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Geografik qamrov</h3>
                  <p className="text-muted-foreground">
                    Barcha filiallar interaktiv xaritada ko'rsatiladi. Mijozlar eng yaqin 
                    filialni topishlari va u yerga qanday borishni bilishlari mumkin.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-white border-2 border-[#3F3091]/30 shadow-lg">
                <Clock className="h-8 w-8 text-[#3F3091] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ish vaqtlari</h3>
                  <p className="text-muted-foreground">
                    Har bir filialning ish vaqtlari, telefon raqamlari va boshqa 
                    muhim ma'lumotlar ko'rsatiladi.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-white border-2 border-[#F07E22]/30 shadow-lg">
                <Zap className="h-8 w-8 text-[#F07E22] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Tezkor qaror</h3>
                  <p className="text-muted-foreground">
                    Mijozlar filialni tanlash va u yerga yozilishni bir necha soniyada 
                    amalga oshirishlari mumkin. Bu konversiyani oshiradi.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-white border-2 border-[#3F3091]/30 shadow-lg">
                <Shield className="h-8 w-8 text-[#3F3091] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ishonchli ma'lumot</h3>
                  <p className="text-muted-foreground">
                    Barcha filiallar haqida to'liq va yangilangan ma'lumotlar. 
                    Mijozlar xato ma'lumotlar tufayli vaqt yo'qotmaydi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {branches.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Bizning filiallarimiz</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {branches.slice(0, 4).map((branch) => {
                  const name = locale === 'ru' ? branch.name_ru : branch.name_uz;
                  const address = locale === 'ru' ? branch.address_ru : branch.address_uz;
                  const region = locale === 'ru' ? branch.region_ru : branch.region_uz;
                  
                  return (
                    <div 
                      key={branch.id}
                      className="group p-6 rounded-lg bg-white border-2 border-border shadow-lg transition-all hover:shadow-xl hover:border-[#F07E22]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#F07E22] to-[#3F3091] flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold mb-2">{name}</h4>
                          {region && (
                            <p className="text-sm text-[#3F3091] font-medium mb-2">{region}</p>
                          )}
                          {address && (
                            <p className="text-sm text-muted-foreground mb-3">{address}</p>
                          )}
                          {branch.phonePrimary && (
                            <p className="text-sm font-medium text-[#F07E22]">
                              📞 {branch.phonePrimary}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ),
      contentRu: (
        <div className="space-y-8">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Почему важен раздел филиалов?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Клиенты могут найти ближайший филиал и узнать, как туда добраться
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-white border-2 border-[#F07E22]/30 shadow-lg">
                <MapPin className="h-8 w-8 text-[#F07E22] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Географический Охват</h3>
                  <p className="text-muted-foreground">
                    Все филиалы показаны на интерактивной карте. Клиенты могут найти 
                    ближайший филиал и узнать, как туда добраться.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-white border-2 border-[#3F3091]/30 shadow-lg">
                <Clock className="h-8 w-8 text-[#3F3091] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Часы Работы</h3>
                  <p className="text-muted-foreground">
                    Показаны часы работы, телефонные номера и другая важная информация 
                    для каждого филиала.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-white border-2 border-[#F07E22]/30 shadow-lg">
                <Zap className="h-8 w-8 text-[#F07E22] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Быстрое Решение</h3>
                  <p className="text-muted-foreground">
                    Клиенты могут выбрать филиал и записаться туда за несколько секунд. 
                    Это повышает конверсию.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-white border-2 border-[#3F3091]/30 shadow-lg">
                <Shield className="h-8 w-8 text-[#3F3091] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Надежная Информация</h3>
                  <p className="text-muted-foreground">
                    Полная и актуальная информация о всех филиалах. 
                    Клиенты не теряют время из-за неверной информации.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {branches.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Наши Филиалы</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {branches.slice(0, 4).map((branch) => {
                  const name = locale === 'ru' ? branch.name_ru : branch.name_uz;
                  const address = locale === 'ru' ? branch.address_ru : branch.address_uz;
                  const region = locale === 'ru' ? branch.region_ru : branch.region_uz;
                  
                  return (
                    <div 
                      key={branch.id}
                      className="group p-6 rounded-lg bg-white border-2 border-border shadow-lg transition-all hover:shadow-xl hover:border-[#F07E22]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#F07E22] to-[#3F3091] flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold mb-2">{name}</h4>
                          {region && (
                            <p className="text-sm text-[#3F3091] font-medium mb-2">{region}</p>
                          )}
                          {address && (
                            <p className="text-sm text-muted-foreground mb-3">{address}</p>
                          )}
                          {branch.phonePrimary && (
                            <p className="text-sm font-medium text-[#F07E22]">
                              📞 {branch.phonePrimary}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'mobile',
      title: 'Mobil versiya — har qanday joyda, har qanday vaqtda',
      titleRu: 'Мобильная версия — в любом месте, в любое время',
      content: (
        <div className="space-y-8">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Mobil versiya nima uchun muhim?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ko'pchilik mijozlar mobil qurilmalardan foydalanadi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-[#F07E22]/10 to-white border-2 border-[#F07E22]/30">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-[#F07E22]" />
              <h3 className="text-xl font-semibold mb-2">Responsive dizayn</h3>
              <p className="text-muted-foreground text-sm">
                Barcha ekran o'lchamlarida mukammal ko'rinish va ishlash
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-[#3F3091]/10 to-white border-2 border-[#3F3091]/30">
              <Zap className="h-12 w-12 mx-auto mb-4 text-[#3F3091]" />
              <h3 className="text-xl font-semibold mb-2">Tez yuklanish</h3>
              <p className="text-muted-foreground text-sm">
                Optimallashtirilgan kod va rasmlar tez yuklanishni ta'minlaydi
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-[#F07E22]/10 to-white border-2 border-[#F07E22]/30">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-[#F07E22]" />
              <h3 className="text-xl font-semibold mb-2">Qulay interfeys</h3>
              <p className="text-muted-foreground text-sm">
                Barmoq bilan boshqarish uchun optimallashtirilgan tugmalar va formalar
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#F07E22] to-[#3F3091] rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-6 text-center">Mobil versiya afzalliklari</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Har qanday joydan kirish</h4>
                    <p className="text-sm opacity-90">Uyda, yo'lda yoki ishda — har qanday joydan</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Tezkor yozilish</h4>
                    <p className="text-sm opacity-90">Bir necha bosish bilan qabulga yozilish</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">GPS integratsiyasi</h4>
                    <p className="text-sm opacity-90">Eng yaqin filialni topish va yo'nalish olish</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Telefon qo'ng'iroqlari</h4>
                    <p className="text-sm opacity-90">Bir bosish bilan telefon qilish</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Push-xabarnomalar</h4>
                    <p className="text-sm opacity-90">Yangiliklar va takliflar haqida xabardor bo'lish</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Offline rejim</h4>
                    <p className="text-sm opacity-90">Ba'zi funksiyalar internet bo'lmasa ham ishlaydi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Demo Section */}
          <div className="mt-12 flex justify-center">
            <MobileDemo settings={settings} locale={locale} />
          </div>

          <div className="mt-8 p-6 rounded-lg bg-muted/50">
            <h3 className="text-xl font-bold mb-4 text-center">Statistika</h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-[#F07E22] mb-1">70%+</div>
                <div className="text-sm text-muted-foreground">Mobil trafik</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#3F3091] mb-1">3x</div>
                <div className="text-sm text-muted-foreground">Tezroq konversiya</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#F07E22] mb-1">50%+</div>
                <div className="text-sm text-muted-foreground">Ko'proq yozilishlar</div>
              </div>
            </div>
          </div>
        </div>
      ),
      contentRu: (
        <div className="space-y-8">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Почему важна мобильная версия?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Большинство клиентов используют мобильные устройства
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-[#F07E22]/10 to-white border-2 border-[#F07E22]/30">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-[#F07E22]" />
              <h3 className="text-xl font-semibold mb-2">Адаптивный Дизайн</h3>
              <p className="text-muted-foreground text-sm">
                Идеальный вид и работа на всех размерах экранов
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-[#3F3091]/10 to-white border-2 border-[#3F3091]/30">
              <Zap className="h-12 w-12 mx-auto mb-4 text-[#3F3091]" />
              <h3 className="text-xl font-semibold mb-2">Быстрая Загрузка</h3>
              <p className="text-muted-foreground text-sm">
                Оптимизированный код и изображения обеспечивают быструю загрузку
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-[#F07E22]/10 to-white border-2 border-[#F07E22]/30">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-[#F07E22]" />
              <h3 className="text-xl font-semibold mb-2">Удобный Интерфейс</h3>
              <p className="text-muted-foreground text-sm">
                Оптимизированные кнопки и формы для управления пальцем
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#F07E22] to-[#3F3091] rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-6 text-center">Преимущества Мобильной Версии</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Доступ из любого места</h4>
                    <p className="text-sm opacity-90">Дома, в дороге или на работе — из любого места</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Быстрая запись</h4>
                    <p className="text-sm opacity-90">Записаться на прием несколькими нажатиями</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">GPS интеграция</h4>
                    <p className="text-sm opacity-90">Найти ближайший филиал и получить маршрут</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Телефонные звонки</h4>
                    <p className="text-sm opacity-90">Позвонить одним нажатием</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Push-уведомления</h4>
                    <p className="text-sm opacity-90">Быть в курсе новостей и предложений</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Офлайн режим</h4>
                    <p className="text-sm opacity-90">Некоторые функции работают даже без интернета</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-lg bg-muted/50">
            <h3 className="text-xl font-bold mb-4 text-center">Статистика</h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-[#F07E22] mb-1">70%+</div>
                <div className="text-sm text-muted-foreground">Мобильный трафик</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#3F3091] mb-1">3x</div>
                <div className="text-sm text-muted-foreground">Быстрее конверсия</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#F07E22] mb-1">50%+</div>
                <div className="text-sm text-muted-foreground">Больше записей</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'guide',
      title: 'Xodimlarga tushuntirish qo\'llanmasi',
      titleRu: 'Руководство по объяснению сотрудникам',
      content: (
        <div className="space-y-8">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Qanday tushuntirish kerak?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Xodimlar saytning afzalliklarini tushunishlari va mijozlarga to'g'ri yo'naltirishlari kerak
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-gradient-to-r from-[#F07E22]/10 to-[#3F3091]/10 border-2 border-[#F07E22]/30">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">1️⃣</span>
                <span>Saytning asosiy afzalliklari</span>
              </h3>
              <div className="space-y-3 ml-12">
                <p className="text-muted-foreground">
                  <strong>• 24/7 kirish:</strong> Mijozlar har qanday vaqtda saytga kirib, ma'lumot olishlari va yozilishlari mumkin.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Mobil qulaylik:</strong> Ko'pchilik mijozlar telefon orqali kirishadi — bu ularga qulay.
                </p>
                <p className="text-muted-foreground">
                  <strong>• To'liq ma'lumot:</strong> Barcha xizmatlar, narxlar va mutaxassislar haqida batafsil ma'lumot.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-r from-[#3F3091]/10 to-[#F07E22]/10 border-2 border-[#3F3091]/30">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">2️⃣</span>
                <span>Mutaxassislar kartochkalari</span>
              </h3>
              <div className="space-y-3 ml-12">
                <p className="text-muted-foreground">
                  <strong>• Ishonch oshirish:</strong> Mijozlar mutaxassisning fotosurati va tajribasini ko'rishadi — bu ishonchni oshiradi.
                </p>
                <p className="text-muted-foreground">
                  <strong>• To'g'ridan-to'g'ri yozilish:</strong> Har bir mutaxassis kartochkasidan to'g'ridan-to'g'ri qabulga yozilish mumkin.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Qanday tushuntirish:</strong> "Saytimizda barcha mutaxassislarimizning profillari bor. Siz ularning fotosurati, tajribasi va mutaxassislik sohalarini ko'rishingiz mumkin."
                </p>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-r from-[#F07E22]/10 to-[#3F3091]/10 border-2 border-[#F07E22]/30">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">3️⃣</span>
                <span>Filiallar bo'limi</span>
              </h3>
              <div className="space-y-3 ml-12">
                <p className="text-muted-foreground">
                  <strong>• Geografik qamrov:</strong> Barcha filiallar xaritada ko'rsatiladi — mijozlar eng yaqin filialni topishadi.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Qulaylik:</strong> Ish vaqtlari, telefon raqamlari va manzillar — hammasi bir joyda.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Qanday tushuntirish:</strong> "Saytimizda barcha filiallarimizning xaritasi bor. Siz eng yaqin filialni topib, u yerga qanday borishni ko'rishingiz mumkin."
                </p>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-r from-[#3F3091]/10 to-[#F07E22]/10 border-2 border-[#3F3091]/30">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">4️⃣</span>
                <span>Onlayn yozilish</span>
              </h3>
              <div className="space-y-3 ml-12">
                <p className="text-muted-foreground">
                  <strong>• Tezkorlik:</strong> Bir necha bosish bilan qabulga yozilish — telefon qo'ng'irog'iga hojat yo'q.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Qulaylik:</strong> Har qanday vaqtda, har qanday joydan yozilish mumkin.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Qanday tushuntirish:</strong> "Saytimizda onlayn yozilish forma bor. Siz bir necha daqiqada qabulga yozilishingiz mumkin. Biz sizga qo'ng'iroq qilamiz va tasdiqlaymiz."
                </p>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-r from-[#F07E22]/10 to-[#3F3091]/10 border-2 border-[#F07E22]/30">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">5️⃣</span>
                <span>Mobil versiya</span>
              </h3>
              <div className="space-y-3 ml-12">
                <p className="text-muted-foreground">
                  <strong>• Qulaylik:</strong> Telefon yoki planshetdan ham sayt mukammal ishlaydi.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Tezlik:</strong> Mobil versiya tez yuklanadi va qulay interfeysga ega.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Qanday tushuntirish:</strong> "Saytimiz mobil qurilmalarda ham mukammal ishlaydi. Telefon yoki planshetdan ham barcha funksiyalardan foydalanishingiz mumkin."
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-[#F07E22] to-[#3F3091] text-white">
            <h3 className="text-2xl font-bold mb-4">Muhim maslahatlar</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                <p>Har doim saytning yangi funksiyalarini va yangilanishlarini bilish</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                <p>Mijozlarga saytni ko'rsatish va qanday foydalanishni tushuntirish</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                <p>Savollar bo'lsa, mijozlarni saytga yo'naltirish</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                <p>Saytning afzalliklarini doim eslatib turish</p>
              </div>
            </div>
          </div>
        </div>
      ),
      contentRu: (
        <div className="space-y-8">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Как Объяснять?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Сотрудники должны понимать преимущества сайта и правильно направлять клиентов
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-gradient-to-r from-[#F07E22]/10 to-[#3F3091]/10 border-2 border-[#F07E22]/30">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">1️⃣</span>
                <span>Основные Преимущества Сайта</span>
              </h3>
              <div className="space-y-3 ml-12">
                <p className="text-muted-foreground">
                  <strong>• Доступ 24/7:</strong> Клиенты могут зайти на сайт в любое время, получить информацию и записаться.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Мобильное удобство:</strong> Большинство клиентов заходят через телефон — это удобно для них.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Полная информация:</strong> Подробная информация обо всех услугах, ценах и специалистах.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-r from-[#3F3091]/10 to-[#F07E22]/10 border-2 border-[#3F3091]/30">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">2️⃣</span>
                <span>Карточки Специалистов</span>
              </h3>
              <div className="space-y-3 ml-12">
                <p className="text-muted-foreground">
                  <strong>• Повышение доверия:</strong> Клиенты видят фото и опыт врача — это повышает доверие.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Прямая запись:</strong> С карточки каждого врача можно записаться напрямую.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Как объяснять:</strong> "На нашем сайте есть профили всех наших врачей. Вы можете посмотреть их фото, опыт и области специализации."
                </p>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-r from-[#F07E22]/10 to-[#3F3091]/10 border-2 border-[#F07E22]/30">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">3️⃣</span>
                <span>Раздел Филиалов</span>
              </h3>
              <div className="space-y-3 ml-12">
                <p className="text-muted-foreground">
                  <strong>• Географический охват:</strong> Все филиалы показаны на карте — клиенты найдут ближайший филиал.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Удобство:</strong> Часы работы, телефоны и адреса — всё в одном месте.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Как объяснять:</strong> "На нашем сайте есть карта всех наших филиалов. Вы можете найти ближайший филиал и посмотреть, как туда добраться."
                </p>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-r from-[#3F3091]/10 to-[#F07E22]/10 border-2 border-[#3F3091]/30">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">4️⃣</span>
                <span>Онлайн Запись</span>
              </h3>
              <div className="space-y-3 ml-12">
                <p className="text-muted-foreground">
                  <strong>• Скорость:</strong> Записаться на прием несколькими нажатиями — не нужно звонить.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Удобство:</strong> Можно записаться в любое время, из любого места.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Как объяснять:</strong> "На нашем сайте есть форма онлайн записи. Вы можете записаться за несколько минут. Мы вам перезвоним и подтвердим."
                </p>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-r from-[#F07E22]/10 to-[#3F3091]/10 border-2 border-[#F07E22]/30">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">5️⃣</span>
                <span>Мобильная Версия</span>
              </h3>
              <div className="space-y-3 ml-12">
                <p className="text-muted-foreground">
                  <strong>• Удобство:</strong> Сайт отлично работает с телефона или планшета.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Скорость:</strong> Мобильная версия быстро загружается и имеет удобный интерфейс.
                </p>
                <p className="text-muted-foreground">
                  <strong>• Как объяснять:</strong> "Наш сайт отлично работает на мобильных устройствах. Вы можете использовать все функции с телефона или планшета."
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-[#F07E22] to-[#3F3091] text-white">
            <h3 className="text-2xl font-bold mb-4">Важные Советы</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                <p>Всегда знать о новых функциях и обновлениях сайта</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                <p>Показывать клиентам сайт и объяснять, как им пользоваться</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                <p>Если есть вопросы, направлять клиентов на сайт</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                <p>Всегда напоминать о преимуществах сайта</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlay(!isAutoPlay);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAutoPlay]);

  return (
    <PresentationLock>
      <div 
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
        style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}
      >
      {/* Header Controls */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocale(locale === 'uz' ? 'ru' : 'uz')}
              className="px-4 py-2 rounded-lg bg-[#F07E22] text-white font-medium hover:opacity-90 transition-opacity"
            >
              {locale === 'uz' ? 'RU' : 'UZ'}
            </button>
            <div className="text-sm text-muted-foreground">
              {locale === 'uz' ? 'Tilni o\'zgartirish' : 'Сменить язык'}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title={locale === 'uz' ? 'Avtomatik o\'ynash' : 'Автовоспроизведение'}
            >
              {isAutoPlay ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title={locale === 'uz' ? 'To\'liq ekran' : 'Полный экран'}
            >
              <Eye className="h-5 w-5" />
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
            >
              {locale === 'uz' ? 'Asosiy sahifaga' : 'На главную'}
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="sticky top-[73px] z-40 bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={prevSlide}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    currentSlide === index
                      ? 'bg-[#F07E22] text-white'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  {locale === 'uz' ? slide.title : slide.titleRu}
                </button>
              ))}
            </div>
            <button
              onClick={nextSlide}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              disabled={currentSlide === slides.length - 1}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Slides Container */}
      <div className="relative">
        <div className="overflow-x-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                ref={(el) => (slideRefs.current[index] = el)}
                className="w-full flex-shrink-0 px-4 py-12"
              >
                <div className="max-w-6xl mx-auto">
                  <div className="mb-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#F07E22]">
                      {locale === 'uz' ? slide.title : slide.titleRu}
                    </h1>
                  </div>
                  <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
                    {locale === 'uz' ? slide.content : slide.contentRu}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#F07E22] text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-lg font-semibold mb-2">
            {locale === 'uz' 
              ? 'Acoustic.uz — raqamli transformatsiya' 
              : 'Acoustic.uz — Цифровая Трансформация'}
          </p>
          <p className="text-sm opacity-90">
            {locale === 'uz' 
              ? 'Klaviatura: ← → (slaydlarni o\'zgartirish), Space (avtomatik o\'ynash)' 
              : 'Клавиатура: ← → (переключение слайдов), Space (автовоспроизведение)'}
          </p>
        </div>
      </div>
    </div>
    </PresentationLock>
  );
}

