'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Play,
  Phone,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBilingualText, DEFAULT_LOCALE, type Locale } from '@/lib/locale';
import { getLocaleFromCookie } from '@/lib/locale-client';
import {
  getPublicBanners,
  getPublicServices,
  getHomepageServices,
  getShowcase,
  getHomepageHearingAidItems,
  getHomepageNews,
  getPublicFaq,
  getHomepageJourney,
  getProductCategories,
  BannerResponse,
  ServiceResponse,
  ProductResponse,
  ShowcaseResponse,
  HearingAidItemResponse,
  HomepageNewsItemResponse,
  FaqResponse,
  HomepageJourneyStepResponse,
  ProductCategoryResponse,
} from '@/lib/api';

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  link: string;
};

type FallbackInteracousticsProduct = {
  name_uz: string;
  name_ru: string;
  description_uz?: string;
  description_ru?: string;
  image: string;
  brand: string;
};

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#F07E22"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="24">Acoustic</text></svg>`;
const placeholderImage = `data:image/svg+xml,${encodeURIComponent(placeholderSvg)}`;

const getFallbackSlides = (locale: Locale): HeroSlide[] => [
  {
    id: 'slide-1',
    title: locale === 'ru' ? 'Восстановление слуха' : 'Eshitishni tiklash',
    subtitle: locale === 'ru' ? 'Профессиональная диагностика и подбор слуховых аппаратов' : 'Professional diagnostika va eshitish apparatlari tanlash',
    cta: locale === 'ru' ? 'Записаться на прием' : 'Tekshiruvga yozilish',
    image: placeholderImage,
    link: '#booking',
  },
];

const fallbackServices = [
  {
    title_uz: 'Diagnostic Audiologiya',
    title_ru: 'Диагностическая аудиология',
    excerpt_uz: "Audiometriya, OAE va tympanometriya bo'yicha to'liq tekshiruvlar.",
    excerpt_ru: 'Полная диагностика слуха: аудиометрия, ОАЭ, тимпанометрия.',
    slug: 'diagnostika',
    image: placeholderImage,
  },
  {
    title_uz: 'Quloq apparatlarini tanlash',
    title_ru: 'Подбор слуховых аппаратов',
    excerpt_uz: 'Individual sozlash, moslashtirish va servis xizmatlari.',
    excerpt_ru: 'Индивидуальная настройка и сервис.',
    slug: 'apparatlar',
    image: placeholderImage,
  },
  {
    title_uz: 'Bolalar diagnostikasi',
    title_ru: 'Диагностика для детей',
    excerpt_uz: 'Har bir yoshdagi bolalar uchun audiologik tekshiruvlar.',
    excerpt_ru: 'Аудиологические обследования для детей любого возраста.',
    slug: 'bolalar-diagnostikasi',
    image: placeholderImage,
  },
  {
    title_uz: 'Koxlear implantlar',
    title_ru: 'Кохлеарные импланты',
    excerpt_uz: 'Koxlear implantatsiya va reabilitatsiya xizmatlari.',
    excerpt_ru: 'Кохлеарная имплантация и реабилитация.',
    slug: 'koxlear-implantlar',
    image: placeholderImage,
  },
];

const fallbackHearingItems: Array<
  Pick<HearingAidItemResponse, 'title_uz' | 'title_ru' | 'description_uz' | 'description_ru' | 'id'> & {
    image?: { url: string } | null;
    link?: string | null;
  }
> = [
  {
    id: 'hearing-1',
    title_uz: "Ko'rinmas quloq apparatlari",
    title_ru: 'Незаметные заушные',
    description_uz: "Quloq orqasida qulay joylashadigan, deyarli ko'rinmaydigan modelllar.",
    description_ru: 'Простые в уходе модели, которые легко скрываются за ухом.',
    link: '/catalog/category-invisible',
  },
  {
    id: 'hearing-2',
    title_uz: 'Keksalar uchun',
    title_ru: 'Для пожилых людей',
    description_uz: 'Qulay boshqaruvli, ishonchli va bardoshli eshitish yechimlari.',
    description_ru: 'Надёжные решения для пожилых клиентов.',
    link: '/catalog/category-seniors',
  },
  {
    id: 'hearing-3',
    title_uz: 'Bolalar uchun',
    title_ru: 'Для детей и подростков',
    description_uz: 'Bolalarning nutq rivojlanishini qo\'llab-quvvatlovchi modelllar.',
    description_ru: 'Решения, помогающие ребёнку развивать речь.',
    link: '/catalog/category-children',
  },
  {
    id: 'hearing-4',
    title_uz: 'AI texnologiyalari',
    title_ru: 'С AI-технологиями',
    description_uz: 'Sun\'iy intellekt asosidagi aqlli eshitish yechimlari.',
    description_ru: 'Умные технологии на базе искусственного интеллекта.',
    link: '/catalog/category-ai',
  },
  {
    id: 'hearing-5',
    title_uz: "Ikkinchi darajadagi eshitish yo'qotilishi",
    title_ru: 'Потеря слуха второй степени',
    description_uz: 'O\'rtacha eshitish yo\'qotilishi uchun keng tanlov.',
    description_ru: 'Широкий выбор для умеренной потери слуха.',
    link: '/catalog/category-moderate',
  },
  {
    id: 'hearing-6',
    title_uz: 'Kuchli va superkuchli',
    title_ru: 'Мощные и супермощные',
    description_uz: '3-4 darajali eshitish yo\'qotilishi uchun kuchli apparatlar.',
    description_ru: 'Мощные устройства для потери слуха 3-4 степени.',
    link: '/catalog/category-powerful',
  },
  {
    id: 'hearing-7',
    title_uz: 'Tovushni boshqarish',
    title_ru: 'Управление звуком',
    description_uz: 'Shovqinni niqoblaydigan tovush terapiyasi.',
    description_ru: 'Звуковая терапия, маскирующая шум.',
    link: '/catalog/category-sound-control',
  },
  {
    id: 'hearing-8',
    title_uz: 'Smartfon uchun',
    title_ru: 'Для смартфона',
    description_uz: 'Smartfoningizdan to\'g\'ridan-to\'g\'ri sifatli ovoz.',
    description_ru: 'Высококачественный звук напрямую с вашего смартфона.',
    link: '/catalog/category-smartphone',
  },
  {
    id: 'hearing-9',
    title_uz: "Ko'rinmas",
    title_ru: 'Невидимые',
    description_uz: 'Kichik, sezilmaydigan eshitish apparatlari.',
    description_ru: 'Маленькие, незаметные слуховые аппараты.',
    link: '/catalog/category-invisible-small',
  },
];

const fallbackFaqItems = [
  {
    id: 'faq-1',
    question_uz: 'Eshitish apparati narxi qancha?',
    question_ru: 'Сколько стоит слуховой аппарат?',
    answer_uz: 'Eshitish apparatlari narxi model, funksiyalar va texnik xususiyatlarga qarab farq qiladi. Bizning mutaxassislarimiz sizga eng mos variantni tanlashda yordam beradi.',
    answer_ru: 'Стоимость слуховых аппаратов варьируется в зависимости от модели, функций и технических характеристик. Наши специалисты помогут вам выбрать наиболее подходящий вариант.',
  },
  {
    id: 'faq-2',
    question_uz: 'Qanday qilib to\'g\'ri eshitish apparatini tanlash mumkin?',
    question_ru: 'Как правильно выбрать слуховой аппарат?',
    answer_uz: 'To\'g\'ri eshitish apparatini tanlash uchun eshitish qobiliyatini to\'liq tekshirish kerak. Bizning audiologlarimiz sizga mos apparatni tanlashda yordam beradi.',
    answer_ru: 'Для правильного выбора слухового аппарата необходимо полное обследование слуха. Наши аудиологи помогут вам выбрать подходящий аппарат.',
  },
  {
    id: 'faq-3',
    question_uz: 'Eshitish apparati eshitishni yomonlashtirib yubormaydimi?',
    question_ru: 'Не ухудшит ли слуховой аппарат слух?',
    answer_uz: 'Yo\'q, to\'g\'ri tanlangan va sozlangan eshitish apparati eshitishni yomonlashtirmaydi. Aksincha, u eshitish qobiliyatini saqlab qolishga yordam beradi.',
    answer_ru: 'Нет, правильно подобранный и настроенный слуховой аппарат не ухудшает слух. Напротив, он помогает сохранить слуховую способность.',
  },
  {
    id: 'faq-4',
    question_uz: 'Eshitish apparatini qancha vaqt ishlatish mumkin?',
    question_ru: 'Как долго можно использовать слуховой аппарат?',
    answer_uz: 'Zamonaviy eshitish apparatlari 5-7 yilgacha ishlatilishi mumkin. Muntazam parvarish va texnik xizmat ko\'rsatish muddatini uzaytiradi.',
    answer_ru: 'Современные слуховые аппараты могут использоваться до 5-7 лет. Регулярный уход и техническое обслуживание продлевают срок службы.',
  },
  {
    id: 'faq-5',
    question_uz: 'Eshitish apparatiga qanday parvarish qilish kerak?',
    question_ru: 'Как ухаживать за слуховым аппаратом?',
    answer_uz: 'Eshitish apparatini quruq joyda saqlang, namlikdan himoya qiling va muntazam tozalang. Batareyalarni vaqtida almashtiring.',
    answer_ru: 'Храните слуховой аппарат в сухом месте, защищайте от влаги и регулярно чистите. Своевременно заменяйте батарейки.',
  },
  {
    id: 'faq-6',
    question_uz: 'Eshitish apparatiga kafolat bormi?',
    question_ru: 'Есть ли гарантия на слуховой аппарат?',
    answer_uz: 'Ha, barcha eshitish apparatlariga rasmiy kafolat beriladi. Kafolat muddati modelga qarab 1-3 yilgacha bo\'lishi mumkin.',
    answer_ru: 'Да, на все слуховые аппараты предоставляется официальная гарантия. Срок гарантии может составлять от 1 до 3 лет в зависимости от модели.',
  },
  {
    id: 'faq-7',
    question_uz: 'Agar apparat mos kelmasa, almashtirish mumkinmi?',
    question_ru: 'Можно ли обменять аппарат, если он не подходит?',
    answer_uz: 'Ha, agar apparat sizga mos kelmasa, kafolat muddati davomida almashtirish yoki qaytarish mumkin. Batafsil ma\'lumot uchun biz bilan bog\'laning.',
    answer_ru: 'Да, если аппарат вам не подходит, в течение гарантийного срока возможен обмен или возврат. Для подробной информации свяжитесь с нами.',
  },
  {
    id: 'faq-8',
    question_uz: 'Quloqda shovqin bo\'lsa, eshitish apparati yordam beradimi?',
    question_ru: 'Поможет ли слуховой аппарат, если в ухе шум?',
    answer_uz: 'Zamonaviy eshitish apparatlari tinnitus (quloq shovqini) bilan kurashish uchun maxsus funksiyalarga ega. Mutaxassislarimiz sizga mos yechimni tanlashda yordam beradi.',
    answer_ru: 'Современные слуховые аппараты имеют специальные функции для борьбы с тиннитусом (шумом в ушах). Наши специалисты помогут вам выбрать подходящее решение.',
  },
  {
    id: 'faq-9',
    question_uz: 'Eshitish apparatini sotib olish uchun retsept kerakmi?',
    question_ru: 'Нужен ли рецепт для покупки слухового аппарата?',
    answer_uz: 'Ha, eshitish apparatini sotib olish uchun audiologik tekshiruvdan o\'tish va mutaxassis tavsiyasi olish kerak. Biz sizga to\'liq diagnostika xizmatini ko\'rsatamiz.',
    answer_ru: 'Да, для покупки слухового аппарата необходимо пройти аудиологическое обследование и получить рекомендацию специалиста. Мы предоставляем полную диагностическую услугу.',
  },
  {
    id: 'faq-10',
    question_uz: 'Acoustic eshitish markazi filiallari qayerda joylashgan?',
    question_ru: 'Где расположены филиалы центра слуха Acoustic?',
    answer_uz: 'Bizning filiallarimiz Toshkent shahrida bir nechta joyda joylashgan. Batafsil manzillar va telefon raqamlarini "Manzillar" bo\'limida topishingiz mumkin.',
    answer_ru: 'Наши филиалы расположены в нескольких местах города Ташкента. Подробные адреса и телефоны вы можете найти в разделе "Адреса".',
  },
];

const fallbackInteracoustics: FallbackInteracousticsProduct[] = [
  {
    name_uz: 'Interacoustics AD629',
    name_ru: 'Interacoustics AD629',
    description_uz: 'Audiometriya diagnostikasi uchun zamonaviy yechim.',
    description_ru: 'Современное решение для диагностической аудиометрии.',
    image: placeholderImage,
    brand: 'Interacoustics',
  },
  {
    name_uz: 'OAE MAICO EroScan',
    name_ru: 'OAE MAICO EroScan',
    description_uz: 'Otoakustik emissiya tekshiruvi uchun professional qurilma.',
    description_ru: 'Профессиональное устройство для проверки отоакустической эмиссии.',
    image: placeholderImage,
    brand: 'Interacoustics',
  },
  {
    name_uz: 'Interacoustics Titan',
    name_ru: 'Interacoustics Titan',
    description_uz: 'Tympanometriya va OAE diagnostikasi uchun universal platforma.',
    description_ru: 'Универсальная платформа для тимпанометрии и ОАЭ.',
    image: placeholderImage,
    brand: 'Interacoustics',
  },
  {
    name_uz: 'Interacoustics Affinity Compact',
    name_ru: 'Interacoustics Affinity Compact',
    description_uz: 'Kompakt va ko\'chma diagnostika uskunasi.',
    description_ru: 'Компактное и портативное диагностическое оборудование.',
    image: placeholderImage,
    brand: 'Interacoustics',
  },
];

const fallbackCochlear: FallbackInteracousticsProduct[] = [
  {
    name_uz: 'Cochlear Kanso 2',
    name_ru: 'Cochlear Kanso 2',
    description_uz: "Implantatsiya qilinadigan minigarnituralar uchun engil va ko'rinmas yechim.",
    description_ru: 'Лёгкое и незаметное решение для имплантируемых систем.',
    image: placeholderImage,
    brand: 'Cochlear',
  },
];

const fallbackJourney = [
  {
    title_uz: 'Diagnostika',
    title_ru: 'Диагностика',
    description_uz: 'Professional eshitish tekshiruvi.',
    description_ru: 'Профессиональная диагностика слуха.',
  },
  {
    title_uz: 'Tanlash',
    title_ru: 'Подбор',
    description_uz: 'Sizga mos apparat tanlash.',
    description_ru: 'Подбор подходящего аппарата.',
  },
  {
    title_uz: 'Sozlash va moslashtirish',
    title_ru: 'Настройка и адаптация',
    description_uz: 'Individual sozlash va moslashtirish xizmatlari.',
    description_ru: 'Индивидуальная настройка и адаптация под вас.',
  },
  {
    title_uz: 'Kuzatuv va qo\'llab-quvvatlash',
    title_ru: 'Наблюдение и поддержка',
    description_uz: 'Muntazam kuzatuv va texnik yordam ko\'rsatish.',
    description_ru: 'Регулярное наблюдение и техническая поддержка.',
  },
];

const fallbackNews = [
  {
    title_uz: "Cochlear seminariga taklif",
    title_ru: 'Обучающий семинар Cochlear в Минске',
    excerpt_uz: 'Mutaxassislar va ota-onalar uchun yangi imkoniyatlar va bilimlar. Kattalar va bolalarga quvonch eshitishni yordam berish uchun yanada ko\'proq vositalar va bilimlar.',
    excerpt_ru: 'Еще больше инструментов и знаний, чтобы помочь взрослым и детям услышать радость.',
    slug: '#',
  },
  {
    title_uz: "Afsonaviy Oticon More O'zbekistonda",
    title_ru: 'Легендарный Oticon More в Беларуси',
    excerpt_uz: 'Sun\'iy intellekt bilan jihozlangan yangi avlod eshitish apparatlari. Ular tovushni tahlil qiladi va murakkab vaziyatlarda ham nutqni kuchaytiradi.',
    excerpt_ru: 'Слуховые аппараты нового поколения со встроенным искусственным интеллектом. Они анализируют звук и усиливают речь даже в сложных ситуациях.',
    slug: '#',
  },
  {
    title_uz: "Belarusbankdan imtiyozli kredit",
    title_ru: 'Льготный кредит от Беларусбанка',
    excerpt_uz: 'Endi siz tanlov bilan cheklanish yoki eshitish muammosini hal qilishni kechiktirishingiz kerak emas. Imtiyozli shartlarda moliyalashtirish imkoniyati.',
    excerpt_ru: 'Вам больше не придется ограничивать себя в выборе и откладывать решение проблемы со слухом. Возможность финансирования на льготных условиях.',
    slug: '#',
  },
  {
    title_uz: "Acoustic markazlarida Oticon Opn S",
    title_ru: 'Oticon Opn S в Центрах хорошего слуха',
    excerpt_uz: 'Innovatsion Oticon Opn S eshitish apparatlari endi Acoustic markazlarida sotuvda. Zamonaviy texnologiyalar va tabiiy ovoz.',
    excerpt_ru: 'Инновационные слуховые аппараты Otcion Opn S уже доступны для покупки в Центрах хорошего слуха. Современные технологии и естественный звук.',
    slug: '#',
  },
  {
    title_uz: "Eshitish buzilishi va dementsiya",
    title_ru: 'Нарушение слуха и деменция',
    excerpt_uz: 'Eshitish qobiliyatining pasayishi va dementsiya rivojlanishi qanday bog\'liq? Acoustic markazining bosh shifokori tushuntirib beradi.',
    excerpt_ru: 'Как связаны тугоухость и развитие деменции, рассказывает Главный врач Центра хорошего слуха. Своевременное решение проблемы слуха важно для здоровья мозга.',
    slug: '#',
  },
  {
    title_uz: "Qandli diabet va eshitish buzilishi",
    title_ru: 'Сахарный диабет и тугоухость',
    excerpt_uz: 'Qandli diabet eshitish buzilishlarining paydo bo\'lishi va rivojlanishi uchun xavf omili sifatida. Profilaktika va muntazam tekshiruvlar muhim.',
    excerpt_ru: 'Сахарный диабет, как фактор риска появления и развития слуховых нарушений. Профилактика и регулярные проверки слуха важны для диабетиков.',
    slug: '#',
  },
];

function isProductResponse(
  product: ProductResponse | FallbackInteracousticsProduct,
): product is ProductResponse {
  return 'slug' in product;
}

// Helper to get locale from DOM - works on client only
// Fixed: Read from server-set values only, no re-detection after mount
function getClientLocale(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  
  // Read from HTML data attribute first (set by server, available immediately)
  const htmlLocale = document.documentElement.getAttribute('data-locale');
  if (htmlLocale === 'ru' || htmlLocale === 'uz') {
    return htmlLocale as Locale;
  }
  
  // Fallback to window.__NEXT_LOCALE__ (set by script before React)
  if (typeof window !== 'undefined' && (window as { __NEXT_LOCALE__?: string }).__NEXT_LOCALE__) {
    const windowLocale = (window as { __NEXT_LOCALE__?: string }).__NEXT_LOCALE__;
    if (windowLocale === 'ru' || windowLocale === 'uz') {
      return windowLocale as Locale;
    }
  }
  
  // Fallback to cookie
  return getLocaleFromCookie();
}

export default function HomePage() {
  const queryClient = useQueryClient();
  const [activeSlide, setActiveSlide] = useState(0);
  const [manualRefreshKey, setManualRefreshKey] = useState(0);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  
  // Make locale reactive: read from server-set values and update when they change
  // The server sets data-locale and window.__NEXT_LOCALE__ based on the cookie
  const [displayLocale, setDisplayLocale] = useState<Locale>(() => {
    // On client, read from server-set values immediately
    if (typeof document !== 'undefined') {
      return getClientLocale();
    }
    return DEFAULT_LOCALE;
  });
  
  // Watch for locale changes (e.g., after language switch and page reload)
  // This ensures the component updates when the locale cookie changes
  useEffect(() => {
    const updateLocale = () => {
      const newLocale = getClientLocale();
      if (newLocale !== displayLocale) {
        setDisplayLocale(newLocale);
      }
    };
    
    // Update immediately on mount (in case cookie changed)
    updateLocale();
    
    // Also watch for changes to data-locale attribute (set by server)
    const observer = new MutationObserver(() => {
      updateLocale();
    });
    
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-locale'],
      });
    }
    
    // Also check periodically (fallback for edge cases)
    const interval = setInterval(updateLocale, 1000);
    
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [displayLocale]);

  // Fetch data with correct locale
  // Note: React Query will automatically refetch when displayLocale changes (different query key)
  // All queries now handle errors gracefully - they return empty arrays/undefined on error
  // This allows the UI to always display fallback content when backend is unavailable
  const { data: bannerData, isLoading: bannersLoading, error: bannersError } = useQuery<BannerResponse[]>({
    queryKey: ['banners', displayLocale],
    queryFn: () => getPublicBanners(displayLocale),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
    throwOnError: false,
    // Provide fallback data
    placeholderData: [],
  });
  
  // Debug: Log banner data
  if (typeof window !== 'undefined') {
    console.log('[HomePage] Banner data:', bannerData);
    console.log('[HomePage] Banners loading:', bannersLoading);
    console.log('[HomePage] Banners error:', bannersError);
  }
  
  const { data: serviceData, refetch: refetchServices } = useQuery<ServiceResponse[]>({
    queryKey: ['homepage-services', displayLocale, manualRefreshKey],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[HomePage] 🔄 [${timestamp}] Fetching homepage services from API...`);
      const result = await getHomepageServices(displayLocale);
      console.log(`[HomePage] ✅ [${timestamp}] Received services:`, result?.length || 0, result);
      if (result && Array.isArray(result)) {
        result.forEach((s, i) => {
          console.log(`[HomePage]   Service ${i + 1}: ${s.title_uz} (ID: ${s.id})`);
        });
      }
      return result;
    },
    staleTime: 0, // Always refetch to show latest changes from admin
    gcTime: 0, // Don't cache - always fetch fresh
    refetchOnMount: 'always', // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchInterval: 3000, // Refetch every 3 seconds to catch admin changes
    refetchIntervalInBackground: false, // Don't refetch in background
    retry: false,
    throwOnError: false,
    placeholderData: [], // Don't use cached placeholder data
    // Override any defaults from QueryClient
    networkMode: 'online',
  });

  // Expose manual refresh function to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).refreshHomepageServices = () => {
      console.log('[HomePage] 🔄 Manual refresh triggered');
      setManualRefreshKey(prev => prev + 1);
      queryClient.invalidateQueries({ queryKey: ['homepage-services'] });
      refetchServices();
    };
  }
  
  const { data: interacousticsData } = useQuery<ShowcaseResponse | null>({
    queryKey: ['showcase', 'interacoustics', displayLocale],
    queryFn: () => getShowcase('interacoustics', displayLocale),
    staleTime: 0, // Always refetch to show latest changes from admin
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: false,
    throwOnError: false,
    placeholderData: null,
  });
  
  
  const { data: hearingItemsData } = useQuery<HearingAidItemResponse[]>({
    queryKey: ['hearing-aid-items', displayLocale],
    queryFn: () => getHomepageHearingAidItems(displayLocale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    throwOnError: false,
    placeholderData: [],
  });
  
  const { data: categoriesData } = useQuery<ProductCategoryResponse[]>({
    queryKey: ['product-categories', displayLocale],
    queryFn: () => getProductCategories(displayLocale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    throwOnError: false,
    placeholderData: [],
  });
  
  const { data: journeyData } = useQuery<HomepageJourneyStepResponse[]>({
    queryKey: ['homepage-journey', displayLocale],
    queryFn: () => getHomepageJourney(displayLocale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    throwOnError: false,
    placeholderData: [],
  });
  
  const { data: newsItemsData, refetch: refetchNews } = useQuery<HomepageNewsItemResponse[]>({
    queryKey: ['homepage-news', displayLocale, manualRefreshKey],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[HomePage] 🔄 [${timestamp}] Fetching homepage news from API...`);
      const result = await getHomepageNews(displayLocale);
      console.log(`[HomePage] ✅ [${timestamp}] Received news items:`, result?.length || 0, result);
      if (result && Array.isArray(result)) {
        result.forEach((n, i) => {
          console.log(`[HomePage]   News ${i + 1}: ${n.title_uz} (ID: ${n.id})`);
        });
      }
      return result;
    },
    staleTime: 0, // Always refetch to show latest changes from admin
    gcTime: 0, // Don't cache - always fetch fresh
    refetchOnMount: 'always', // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchInterval: 3000, // Refetch every 3 seconds to catch admin changes
    refetchIntervalInBackground: false, // Don't refetch in background
    retry: false,
    throwOnError: false,
    placeholderData: [], // Don't use cached placeholder data
    networkMode: 'online',
  });
  
  // Expose manual refresh function to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).refreshHomepageNews = () => {
      console.log('[HomePage] 🔄 Manual news refresh triggered');
      setManualRefreshKey(prev => prev + 1);
      queryClient.invalidateQueries({ queryKey: ['homepage-news'] });
      refetchNews();
    };
  }
  
  const { data: faqData, refetch: refetchFaq } = useQuery<FaqResponse[]>({
    queryKey: ['faq', displayLocale, manualRefreshKey],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[HomePage] 🔄 [${timestamp}] Fetching FAQ from API...`);
      const result = await getPublicFaq(displayLocale);
      console.log(`[HomePage] ✅ [${timestamp}] Received FAQs:`, result?.length || 0, result);
      if (result && Array.isArray(result)) {
        result.forEach((f, i) => {
          console.log(`[HomePage]   FAQ ${i + 1}: ${f.question_uz} (ID: ${f.id})`);
        });
      }
      return result;
    },
    staleTime: 0, // Always refetch to show latest changes from admin
    gcTime: 0, // Don't cache - always fetch fresh
    refetchOnMount: 'always', // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchInterval: 3000, // Refetch every 3 seconds to catch admin changes
    refetchIntervalInBackground: false, // Don't refetch in background
    retry: false,
    throwOnError: false,
    placeholderData: [], // Don't use cached placeholder data
    networkMode: 'online',
  });
  
  // Expose manual refresh function to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).refreshHomepageFaq = () => {
      console.log('[HomePage] 🔄 Manual FAQ refresh triggered');
      setManualRefreshKey(prev => prev + 1);
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      refetchFaq();
    };
  }

  // Get fallback slides based on display locale
  const fallbackSlides = getFallbackSlides(displayLocale);
 
  // Use banner data from admin panel if available and has content, otherwise use fallback
  // Filter to only show banners with valid titles
  const slides: HeroSlide[] = (bannerData && bannerData.length > 0 
    ? bannerData.filter((banner) => banner.title_uz || banner.title_ru)
    : fallbackSlides
  ).map((banner, index) => {
    const isBackend = 'title_uz' in banner || 'title_ru' in banner;
    if (!isBackend) {
      const fallbackSlide = fallbackSlides[index % fallbackSlides.length];
      return {
        id: fallbackSlide.id,
        title: fallbackSlide.title,
        subtitle: fallbackSlide.subtitle,
        cta: fallbackSlide.cta,
        image: fallbackSlide.image,
        link: fallbackSlide.link,
      } satisfies HeroSlide;
    }
    const entity = banner as BannerResponse;
    const fallback = fallbackSlides[index % fallbackSlides.length];
    // Use locale-specific text, fallback to other locale if missing
    const title = displayLocale === 'ru' 
      ? (entity.title_ru || entity.title_uz || fallback.title)
      : (entity.title_uz || entity.title_ru || fallback.title);
    const subtitle = displayLocale === 'ru' 
      ? (entity.text_ru || entity.text_uz || fallback.subtitle || '')
      : (entity.text_uz || entity.text_ru || fallback.subtitle || '');
    const cta = displayLocale === 'ru' 
      ? (entity.ctaText_ru || entity.ctaText_uz || fallback.cta)
      : (entity.ctaText_uz || entity.ctaText_ru || fallback.cta);
    // Extract image URL from MediaResponse or use fallback
    // Convert relative URLs to absolute URLs by prepending API base URL
    let imageUrl = entity.image?.url || fallback.image;
    if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
      // Relative URL - prepend API base URL (without /api suffix since uploads are at root)
      // NEXT_PUBLIC_API_URL should be available on both server and client
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      // Remove /api from the base URL if present, since uploads are served from root
      const baseUrl = apiBase.replace('/api', '');
      imageUrl = `${baseUrl}${imageUrl}`;
    }
    
    return {
      id: entity.id ?? `banner-${index}`,
      title: title || fallback.title,
      subtitle: subtitle || fallback.subtitle || '',
      cta: cta || fallback.cta,
      image: imageUrl,
      link: entity.ctaLink || fallback.link,
    } satisfies HeroSlide;
  });

  // Debug: Log service data - ENHANCED
  if (typeof window !== 'undefined') {
    console.log('[HomePage] ========== SERVICE DATA DEBUG ==========');
    console.log('[HomePage] Service data from API:', serviceData);
    console.log('[HomePage] Service data length:', serviceData?.length);
    console.log('[HomePage] Service data type:', typeof serviceData);
    console.log('[HomePage] Is array?', Array.isArray(serviceData));
    if (serviceData && Array.isArray(serviceData)) {
      serviceData.forEach((s, i) => {
        console.log(`[HomePage] Service ${i + 1} from API:`, {
          id: s?.id,
          title_uz: s?.title_uz,
          title_ru: s?.title_ru,
          slug: s?.slug,
          hasImage: !!(s as any)?.image,
          hasCover: !!(s as any)?.cover,
        });
      });
    }
    console.log('[HomePage] ==========================================');
  }

  // Ensure we always have exactly 4 services (use fallback if needed)
  // If backend returns services, use them; otherwise use fallback services
  // Always pad or slice to exactly 4 services
  // REMOVED: servicesToUse variable - not actually used in the code below
  
  // Create exactly 4 services, cycling through available services if needed
  // FIXED: Always prioritize API data when available - simplify logic
  const services = Array.from({ length: 4 }, (_, index) => {
    // Get service from backend data if available, otherwise use fallback
    const service = index < (serviceData?.length ?? 0) ? serviceData![index] : null;
    const fallback = fallbackServices[index % fallbackServices.length];
    
    // FIXED: Simplified check - if we have serviceData array with items, always use API data
    // Check if service is from backend (ServiceResponse has id, title_uz, title_ru)
    // Note: slug is optional in HomepageService, so we check for id instead
    const hasValidServiceData = serviceData && Array.isArray(serviceData) && serviceData.length > 0;
    const isBackendService = hasValidServiceData && service && 'id' in service && 'title_uz' in service && 'title_ru' in service;
    const backendService = isBackendService ? (service as ServiceResponse) : null;
    
    // Use backend service data if available, otherwise use fallback
    // If backend data is missing Russian but we're in Russian locale, use fallback Russian
    const backendTitleUz = backendService?.title_uz ?? '';
    const backendTitleRu = backendService?.title_ru ?? '';
    const backendExcerptUz = backendService?.excerpt_uz ?? '';
    const backendExcerptRu = backendService?.excerpt_ru ?? '';
    
    // If we have backend data but it's missing Russian translations, use fallback
    const useFallbackForTitle = backendService && displayLocale === 'ru' && !backendTitleRu && fallback.title_ru;
    const useFallbackForDescription = backendService && displayLocale === 'ru' && !backendExcerptRu && fallback.excerpt_ru;
    
    const localizedTitle = useFallbackForTitle
      ? fallback.title_ru
      : getBilingualText(backendTitleUz || fallback.title_uz, backendTitleRu || fallback.title_ru, displayLocale);
    const localizedDescription = useFallbackForDescription
      ? fallback.excerpt_ru
      : getBilingualText(backendExcerptUz || (fallback.excerpt_uz ?? ''), backendExcerptRu || (fallback.excerpt_ru ?? ''), displayLocale);
    // Handle slug - it might be null/undefined for homepage services
    const slug = backendService 
      ? (backendService.slug || backendService.id || fallback.slug)
      : fallback.slug;
    
    // Debug: Log service being used - ENHANCED (after variables are defined)
    if (typeof window !== 'undefined') {
      if (index === 0) {
        console.log('[HomePage] ========== RENDERED SERVICES DEBUG ==========');
        console.log('[HomePage] serviceData exists?', !!serviceData);
        console.log('[HomePage] serviceData is array?', Array.isArray(serviceData));
        console.log('[HomePage] serviceData length?', serviceData?.length);
        console.log('[HomePage] hasValidServiceData?', hasValidServiceData);
      }
      console.log(`[HomePage] Service ${index + 1}:`, {
        serviceFromAPI: service ? { id: service.id, title_uz: (service as any).title_uz, title_ru: (service as any).title_ru } : null,
        hasValidServiceData,
        isBackendService,
        renderedTitle: localizedTitle,
        renderedSlug: slug,
        usingFallback: !isBackendService,
        fallbackTitle: fallback.title_uz,
      });
      // Show warning if we should use backend but aren't
      if (hasValidServiceData && service && !isBackendService) {
        console.warn(`[HomePage] ⚠️ Service ${index + 1} has API data but not using it!`, service);
      }
      if (index === 3) {
        console.log('[HomePage] ===============================================');
      }
    }
    // Use image from API (homepage services use 'image', regular services use 'cover')
    // Check both 'image' (homepage services) and 'cover' (regular services) for compatibility
    const image = (backendService as any)?.image?.url ?? (backendService as any)?.cover?.url ?? fallback.image ?? placeholderImage;
    
    return {
      id: backendService?.id ?? slug ?? `service-${index}`,
      title: localizedTitle || `Service ${index + 1}`,
      description: localizedDescription || '',
      slug: slug || `service-${index}`,
      image: image || placeholderImage,
    };
  });

  // Always use hearing aid items for the "Eshitish aparatlari" section
  // Use backend data if available, otherwise use fallback items
  const hearingItemsSource = hearingItemsData && hearingItemsData.length > 0 
    ? hearingItemsData 
    : fallbackHearingItems;
  
  // Create exactly 9 items, cycling through available items if needed
  const hearingItems = Array.from({ length: 9 }, (_, index) => {
    const item = hearingItemsSource[index % hearingItemsSource.length];
    const fallback = fallbackHearingItems[index % fallbackHearingItems.length];
    
    // Prefer fallback Russian if API data is missing Russian but we're in Russian locale
    const itemTitleUz = item.title_uz ?? '';
    const itemTitleRu = item.title_ru ?? '';
    const itemDescUz = item.description_uz ?? '';
    const itemDescRu = item.description_ru ?? '';
    
    // If API data exists but missing Russian and we're in Russian locale, prefer fallback Russian
    const hasApiData = item && 'id' in item && itemTitleUz;
    const useFallbackForTitle = hasApiData && displayLocale === 'ru' && !itemTitleRu && fallback.title_ru;
    const useFallbackForDescription = hasApiData && displayLocale === 'ru' && !itemDescRu && fallback.description_ru;
    
    const title = useFallbackForTitle
      ? fallback.title_ru
      : getBilingualText(itemTitleUz || fallback.title_uz, itemTitleRu || fallback.title_ru, displayLocale);
    const description = useFallbackForDescription
      ? fallback.description_ru
      : getBilingualText(itemDescUz || (fallback.description_uz ?? ''), itemDescRu || (fallback.description_ru ?? ''), displayLocale);
    const image = item.image?.url ?? placeholderImage;
    const link = item.link ?? fallback.link ?? '/catalog';
    
    return {
      id: item.id ?? fallback.id ?? `hearing-${index}`,
      title,
      description,
      image,
      link,
      hasImage: !!item.image?.url,
    };
  });

  const interacousticsSource: (ProductResponse | FallbackInteracousticsProduct)[] =
    interacousticsData?.products && interacousticsData.products.length > 0
      ? interacousticsData.products
      : fallbackInteracoustics;

  // Always create exactly 4 products, cycling through available items if needed
  const interacousticsProducts = Array.from({ length: 4 }, (_, index) => {
    const product = interacousticsSource[index % interacousticsSource.length];
    const fallback = fallbackInteracoustics[index % fallbackInteracoustics.length];
    if (isProductResponse(product)) {
      const titleUz = product.name_uz ?? '';
      const titleRu = product.name_ru ?? '';
      const descriptionUz = product.description_uz ?? '';
      const descriptionRu = product.description_ru ?? '';
      
      // If API data is missing Russian but we're in Russian locale, prefer fallback Russian
      const finalTitleUz = titleUz || fallback.name_uz;
      const finalTitleRu = titleRu || fallback.name_ru;
      const finalDescriptionUz = descriptionUz || (fallback.description_uz ?? '');
      const finalDescriptionRu = descriptionRu || (fallback.description_ru ?? '');
      
      const image = product.brand?.logo?.url ?? fallback.image;
      const brand = product.brand?.name ?? fallback.brand;
      
      return {
        id: product.slug ?? product.id ?? `interacoustics-${index}`,
        title: getBilingualText(finalTitleUz, finalTitleRu, displayLocale),
        description: getBilingualText(finalDescriptionUz, finalDescriptionRu, displayLocale),
        image,
        brand,
        slug: product.slug,
      };
    }
    
    // For fallback products, use getBilingualText as well
    return {
      id: `interacoustics-fallback-${index}`,
      title: getBilingualText(product.name_uz ?? fallback.name_uz, product.name_ru ?? fallback.name_ru, displayLocale),
      description: getBilingualText(product.description_uz ?? fallback.description_uz ?? '', product.description_ru ?? fallback.description_ru ?? '', displayLocale),
      image: product.image,
      brand: product.brand,
      slug: undefined,
    };
  });


  // Always create exactly 4 journey steps, using API data if available, otherwise fallback
  const journeySource = journeyData && journeyData.length > 0 
    ? journeyData 
    : fallbackJourney.map((step, i) => ({
        id: `journey-${i}`,
        title_uz: step.title_uz,
        title_ru: step.title_ru,
        description_uz: step.description_uz,
        description_ru: step.description_ru,
        order: i + 1,
        status: 'published' as const,
      }));
  
  const journeySteps = Array.from({ length: 4 }, (_, index) => {
    const step = journeySource[index % journeySource.length];
    const fallback = fallbackJourney[index % fallbackJourney.length];
    const title = getBilingualText(step.title_uz ?? fallback.title_uz, step.title_ru ?? fallback.title_ru, displayLocale);
    const description = getBilingualText(step.description_uz ?? fallback.description_uz ?? '', step.description_ru ?? fallback.description_ru ?? '', displayLocale);
    return {
      id: step.id ?? `journey-${index}`,
      title,
      description,
      order: step.order ?? index + 1,
    };
  });

  // Always create exactly 6 news items, using API data if available, otherwise fallback
  const hasValidNewsData = newsItemsData && Array.isArray(newsItemsData) && newsItemsData.length > 0;
  const newsSource = hasValidNewsData 
    ? newsItemsData 
    : fallbackNews.map((item, i) => ({
        id: `news-${i}`,
        title_uz: item.title_uz,
        title_ru: item.title_ru,
        excerpt_uz: item.excerpt_uz,
        excerpt_ru: item.excerpt_ru,
        slug: item.slug,
        publishedAt: new Date().toISOString(),
        order: i + 1,
        status: 'published' as const,
      }));
  
  if (typeof window !== 'undefined') {
    console.log('[HomePage] ========== NEWS RENDERING DEBUG ==========');
    console.log('[HomePage] newsItemsData exists?', !!newsItemsData);
    console.log('[HomePage] newsItemsData is array?', Array.isArray(newsItemsData));
    console.log('[HomePage] newsItemsData length?', newsItemsData?.length);
    console.log('[HomePage] hasValidNewsData?', hasValidNewsData);
    console.log('[HomePage] newsSource length?', newsSource.length);
    console.log('[HomePage] Using API data?', hasValidNewsData);
  }
  
  const newsItems = Array.from({ length: 6 }, (_, index) => {
    const item = newsSource[index % newsSource.length];
    const fallback = fallbackNews[index % fallbackNews.length];
    
    // Check if this is API data (has id and title fields)
    const isApiData = hasValidNewsData && item && 'id' in item && 'title_uz' in item;
    
    // Get API data if available, otherwise use empty strings
    const apiTitleUz = isApiData ? ((item as HomepageNewsItemResponse).title_uz ?? '') : '';
    const apiTitleRu = isApiData ? ((item as HomepageNewsItemResponse).title_ru ?? '') : '';
    const apiExcerptUz = isApiData ? ((item as HomepageNewsItemResponse).excerpt_uz ?? '') : '';
    const apiExcerptRu = isApiData ? ((item as HomepageNewsItemResponse).excerpt_ru ?? '') : '';
    
    // If API data exists but missing Russian and we're in Russian locale, prefer fallback Russian
    const useFallbackForTitle = isApiData && displayLocale === 'ru' && !apiTitleRu && fallback.title_ru;
    const useFallbackForExcerpt = isApiData && displayLocale === 'ru' && !apiExcerptRu && fallback.excerpt_ru;
    
    const title = useFallbackForTitle
      ? fallback.title_ru
      : getBilingualText(apiTitleUz || fallback.title_uz, apiTitleRu || fallback.title_ru, displayLocale);
    const excerpt = useFallbackForExcerpt
      ? fallback.excerpt_ru
      : getBilingualText(apiExcerptUz || (fallback.excerpt_uz ?? ''), apiExcerptRu || (fallback.excerpt_ru ?? ''), displayLocale);
    
    if (typeof window !== 'undefined' && index === 0) {
      console.log('[HomePage] News Item 1:', {
        isApiData,
        title,
        excerpt: excerpt.substring(0, 50) + '...',
        itemId: isApiData ? (item as HomepageNewsItemResponse).id : fallback.title_uz,
      });
    }
    
    return {
      id: isApiData ? (item as HomepageNewsItemResponse).id : `news-${index}`,
      title,
      excerpt,
      slug: isApiData ? (item as HomepageNewsItemResponse).slug : fallback.slug,
      publishedAt: isApiData ? (item as HomepageNewsItemResponse).publishedAt : undefined,
    };
  });
  
  if (typeof window !== 'undefined') {
    console.log('[HomePage] ===============================================');
  }

  // Create exactly 10 FAQ items, using API data if available, otherwise fallback
  const hasValidFaqData = faqData && Array.isArray(faqData) && faqData.length > 0;
  const faqItemsSource = hasValidFaqData ? faqData : fallbackFaqItems;
  
  if (typeof window !== 'undefined') {
    console.log('[HomePage] ========== FAQ RENDERING DEBUG ==========');
    console.log('[HomePage] faqData exists?', !!faqData);
    console.log('[HomePage] faqData is array?', Array.isArray(faqData));
    console.log('[HomePage] faqData length?', faqData?.length);
    console.log('[HomePage] hasValidFaqData?', hasValidFaqData);
    console.log('[HomePage] faqItemsSource length?', faqItemsSource.length);
    console.log('[HomePage] Using API data?', hasValidFaqData);
  }
  
  const faqItems = Array.from({ length: 10 }, (_, index) => {
    const item = faqItemsSource[index % faqItemsSource.length];
    const fallback = fallbackFaqItems[index % fallbackFaqItems.length];
    
    // Check if this is API data (has id and question fields)
    const isApiData = hasValidFaqData && item && 'id' in item && 'question_uz' in item;
    
    // Get API data if available, otherwise use empty strings
    const apiQuestionUz = isApiData ? ((item as FaqResponse).question_uz ?? '') : '';
    const apiQuestionRu = isApiData ? ((item as FaqResponse).question_ru ?? '') : '';
    const apiAnswerUz = isApiData ? ((item as FaqResponse).answer_uz ?? '') : '';
    const apiAnswerRu = isApiData ? ((item as FaqResponse).answer_ru ?? '') : '';
    
    // If API data exists but missing Russian and we're in Russian locale, prefer fallback Russian
    const useFallbackForQuestion = isApiData && displayLocale === 'ru' && !apiQuestionRu && fallback.question_ru;
    const useFallbackForAnswer = isApiData && displayLocale === 'ru' && !apiAnswerRu && fallback.answer_ru;
    
    const question = useFallbackForQuestion
      ? fallback.question_ru
      : getBilingualText(apiQuestionUz || fallback.question_uz, apiQuestionRu || fallback.question_ru, displayLocale);
    const answer = useFallbackForAnswer
      ? fallback.answer_ru
      : getBilingualText(apiAnswerUz || (fallback.answer_uz ?? ''), apiAnswerRu || (fallback.answer_ru ?? ''), displayLocale);
    
    if (typeof window !== 'undefined' && index === 0) {
      console.log('[HomePage] FAQ Item 1:', {
        isApiData,
        question,
        answer: answer.substring(0, 50) + '...',
        itemId: isApiData ? (item as FaqResponse).id : fallback.id,
      });
    }
    
    return {
      id: isApiData ? (item as FaqResponse).id : fallback.id,
      question,
      answer,
    };
  });
  
  if (typeof window !== 'undefined') {
    console.log('[HomePage] ===============================================');
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section with Slides - Two-Column Layout */}
      {slides.length > 0 && (
        <section className="bg-white py-8">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="relative overflow-hidden rounded-lg bg-white shadow-sm">
              <div className="flex flex-col md:flex-row md:items-stretch">
                {/* Left Panel - Text Content with White Background */}
                <div className="relative flex flex-col justify-center bg-white px-6 py-6 md:px-8 md:py-8 md:w-1/2 md:min-h-[320px] rounded-l-lg">
                  {slides.map((slide, index) => (
                    <div
                      key={`text-${slide.id}`}
                      className={`transition-opacity duration-500 ${
                        index === activeSlide ? 'opacity-100 relative z-10' : 'absolute inset-0 opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      <div className="space-y-3 md:space-y-4">
                        {/* Dark Blue Heading */}
                        <h1 className="text-xl font-bold leading-tight text-[#1e3a8a] md:text-2xl lg:text-3xl" suppressHydrationWarning>
                          {slide.title}
                        </h1>
                        {/* Grey Subtitle */}
                        {slide.subtitle && (
                          <p className="text-sm leading-relaxed text-muted-foreground md:text-base" suppressHydrationWarning>
                            {slide.subtitle}
                          </p>
                        )}
                        {/* CTA Buttons Row */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                          {/* Primary Orange CTA Button */}
                          {slide.cta && (
                            <Link
                              href={slide.link}
                              className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary/90 md:px-5 md:py-2.5"
                              suppressHydrationWarning
                            >
                              {slide.cta}
                              <ArrowRight size={14} className="md:w-4 md:h-4" />
                            </Link>
                          )}
                          {/* Secondary White Outlined Phone Button */}
                          <Link
                            href="tel:+998712021441"
                            className="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/50 md:px-5 md:py-2.5"
                            suppressHydrationWarning
                          >
                            <Phone size={14} className="md:w-4 md:h-4" />
                            <span>1385</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Navigation Dots - Bottom Left */}
                  {slides.length > 1 && (
                    <div className="absolute bottom-3 left-6 flex items-center gap-2 z-20 md:bottom-4 md:left-8">
                      {slides.map((_, dotIndex) => (
                        <button
                          key={dotIndex}
                          type="button"
                          onClick={() => setActiveSlide(dotIndex)}
                          className={`h-2 w-2 rounded-full transition-all ${
                            dotIndex === activeSlide
                              ? 'h-2.5 w-2.5 bg-brand-primary'
                              : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
                          }`}
                          aria-label={`Go to slide ${dotIndex + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Panel - Orange Block with Image or "Acoustic" Text */}
                <div className="relative w-full md:w-1/2 bg-brand-primary md:min-h-[320px] rounded-r-lg">
                  {slides.map((slide, index) => {
                    const imageUrl = slide.image;
                    const isActive = index === activeSlide;
                    // Check if we have a real image from backend (not placeholder)
                    // Real images are URLs (http/https) or uploaded media, not data URIs
                    const hasRealImage = imageUrl && 
                      imageUrl !== placeholderImage && 
                      !imageUrl.startsWith('data:image/svg+xml') &&
                      (imageUrl.startsWith('http://') || 
                       imageUrl.startsWith('https://') || 
                       (imageUrl.startsWith('/') && !imageUrl.startsWith('//')));
                    
                    return (
                      <div
                        key={`image-${slide.id}`}
                        className={`absolute inset-0 transition-opacity duration-500 rounded-r-lg ${
                          isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                      >
                        {hasRealImage ? (
                          // Show image if available from backend
                          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6 lg:p-8">
                            <img
                              src={imageUrl}
                              alt={slide.title}
                              className="max-w-full max-h-full object-contain rounded-lg"
                              style={{ 
                                width: 'auto',
                                height: 'auto',
                                maxWidth: 'calc(100% - 2rem)',
                                maxHeight: 'calc(100% - 2rem)'
                              }}
                              onError={(e) => {
                                // If image fails to load, show "Acoustic" text
                                console.warn('[HomePage] Failed to load image:', imageUrl);
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="absolute inset-0 flex items-center justify-center rounded-r-lg"><span class="text-3xl font-bold text-white md:text-4xl lg:text-5xl">Acoustic</span></div>';
                                }
                              }}
                            />
                          </div>
                        ) : (
                          // Show "Acoustic" text if no image (centered in orange block)
                          <div className="absolute inset-0 flex items-center justify-center rounded-r-lg">
                            <span className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">Acoustic</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Services Section - Image-based Cards - Always show 4 in a row */}
      {services.length > 0 && (
        <section className="bg-white py-8">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Наши услуги' : 'Bizning xizmatlar'}
              </h2>
            </div>
            {/* Grid: 1 col on mobile, 2 cols on small screens, 4 cols on medium+ screens */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              {/* Always display exactly 4 services */}
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Service Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      unoptimized={service.image?.startsWith('data:')}
                    />
                  </div>
                  
                  {/* Service Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-brand-primary" suppressHydrationWarning>
                      {service.title}
                    </h3>
                    {service.description && (
                      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground" suppressHydrationWarning>
                        {service.description}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary group-hover:gap-2" suppressHydrationWarning>
                      {displayLocale === 'ru' ? 'Подробнее' : 'Batafsil'}
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hearing Aids Section */}
      {hearingItems.length > 0 && (
        <section className="border-t bg-white py-12">
          <div className="mx-auto max-w-6xl space-y-6 px-4 md:px-6">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Слуховые аппараты' : 'Eshitish apparatlari'}
              </p>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Решения для вашего образа жизни' : 'Turmush tarziga mos eshitish yechimlari'}
              </h2>
              {displayLocale === 'ru' ? (
                <p className="text-base text-muted-foreground" suppressHydrationWarning>
                  Мы подберём модель, которая подходит вашему образу жизни, активности и бюджету.
                </p>
              ) : (
                <p className="text-base text-muted-foreground" suppressHydrationWarning>
                  Biz sizning odatlaringiz, faolligingiz va byudjetingizga mos modelni topamiz.
                </p>
              )}
            </div>
            {/* 3-column grid for categories - exactly 9 items, horizontal layout matching image */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {hearingItems.slice(0, 9).map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  className="group flex flex-row items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-brand-primary/50 hover:shadow-sm"
                >
                  {/* Orange square icon on the left with "Acoustic" text or category image */}
                  <div className="relative w-20 h-20 overflow-hidden rounded-lg bg-brand-primary flex items-center justify-center flex-shrink-0">
                    {(item as any).hasImage && item.image !== placeholderImage ? (
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill 
                        sizes="80px" 
                        className="object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                    ) : (
                      <span className="text-white text-base font-bold">Acoustic</span>
                    )}
                  </div>
                  {/* Category title and description on the right */}
                  <div className="flex flex-col flex-1 space-y-2 min-w-0">
                    <h3 className="text-base font-semibold text-foreground leading-tight group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed" suppressHydrationWarning>
                        {item.description}
                      </p>
                    )}
                    {/* Link text */}
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary group-hover:gap-2 transition-all mt-auto" suppressHydrationWarning>
                      {displayLocale === 'ru' ? 'Подробнее' : 'Batafsil'}
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Interacoustics Section */}
      {interacousticsProducts.length > 0 && (
        <section className="border-t bg-white py-12">
          <div className="mx-auto max-w-6xl space-y-6 px-4 md:px-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary" suppressHydrationWarning>
                  {displayLocale === 'ru' ? 'Interacoustics' : 'Interacoustics'}
                </p>
                <h2 className="text-3xl font-bold text-foreground md:text-4xl" suppressHydrationWarning>
                  {displayLocale === 'ru' ? 'Диагностическое оборудование' : 'Eng so\'nggi diagnostika uskunalari'}
                </h2>
                <p className="text-base text-muted-foreground" suppressHydrationWarning>
                  {displayLocale === 'ru' 
                    ? 'Выбор инновационных решений и устройств для специалистов по аудиологии.'
                    : 'Audiologiya mutaxassislari uchun innovatsion yechimlar va qurilmalar tanlovi.'}
                </p>
              </div>
              <Link 
                href="/catalog" 
                className="inline-flex items-center gap-1 text-base font-medium text-muted-foreground hover:text-brand-primary transition-colors whitespace-nowrap"
                suppressHydrationWarning
              >
                {displayLocale === 'ru' ? 'Полный каталог' : 'To\'liq katalog'}
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              {interacousticsProducts.map((product) => {
                const productLink = product.slug ? `/products/${product.slug}` : '#';
                const hasImage = product.image && product.image !== placeholderImage;
                return (
                  <Link
                    key={product.id}
                    href={productLink}
                    className="group flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden transition hover:border-brand-primary/50 hover:shadow-sm"
                  >
                    {/* Orange placeholder/image area on top */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-primary flex items-center justify-center">
                      {hasImage ? (
                        <Image 
                          src={product.image} 
                          alt={product.title} 
                          fill 
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" 
                          className="object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                      ) : (
                        <span className="text-white text-lg font-bold">Acoustic</span>
                      )}
                    </div>
                    {/* Text content area below */}
                    <div className="flex flex-col flex-1 p-4 space-y-2">
                      <h3 className="text-lg font-semibold text-foreground leading-tight group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                        {product.title}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1" suppressHydrationWarning>
                          {product.description}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary group-hover:gap-2 transition-all mt-auto" suppressHydrationWarning>
                        {displayLocale === 'ru' ? 'Подробнее' : 'Batafsil'}
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}


      {/* Journey Section */}
      {journeySteps.length > 0 && (
        <section className="border-t bg-white py-12">
          <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-6">
          <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Путь к лучшему слуху' : 'Yaxshi eshitishga yo\'l'}
              </p>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Как мы помогаем' : 'Biz qanday yordam beramiz'}
            </h2>
          </div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              {journeySteps.map((step) => (
                <div key={step.id} className="relative flex flex-col gap-4 rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-2xl font-bold text-brand-primary">
                    {step.order}
                  </div>
                  <h3 className="text-lg font-semibold text-brand-accent" suppressHydrationWarning>
                    {step.title}
                </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed" suppressHydrationWarning>
                    {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* News Section */}
      {newsItems.length > 0 && (
        <section className="border-t bg-muted/20 py-12">
          <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-6">
            <div className="space-y-1 text-center">
              <h2 className="text-3xl font-bold text-brand-primary md:text-4xl" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Новости' : 'Yangiliklar'}
              </h2>
            </div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {newsItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.slug && item.slug !== '#' ? `/posts/${item.slug}` : '#'}
                  className="group flex flex-col gap-3 transition hover:opacity-80"
                >
                  <h3 className="text-lg font-semibold text-brand-primary group-hover:text-brand-accent" suppressHydrationWarning>
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed" suppressHydrationWarning>
                    {item.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faqItems.length > 0 && (
        <section className="border-t bg-white py-12">
          <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-6">
            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-brand-primary md:text-3xl" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Часто задаваемые вопросы' : 'Tez-tez beriladigan savollar'}
              </h2>
              <div className="h-px w-20 bg-border"></div>
            </div>
            
            {/* FAQ Grid - 2 columns */}
            <div className="grid gap-4 md:grid-cols-2">
              {faqItems.map((item) => {
                const isOpen = openFaqId === item.id;
                const answerId = `faq-answer-${item.id}`;
                const buttonId = `faq-button-${item.id}`;
                return (
                  <div
                    key={item.id}
                    className="group rounded-lg border border-border/60 bg-muted/30 p-4 transition hover:border-brand-primary/50 hover:shadow-sm"
                  >
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => {
                        // If clicking the same item, close it. Otherwise, open the clicked item (which closes the previous one)
                        setOpenFaqId(isOpen ? null : item.id);
                      }}
                      onKeyDown={(e) => {
                        // Allow Enter and Space to toggle
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setOpenFaqId(isOpen ? null : item.id);
                        }
                      }}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded text-left focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                    >
                      <span className="flex-1 text-sm font-medium text-foreground" suppressHydrationWarning>
                        {item.question}
                      </span>
                      <ChevronDown 
                        aria-hidden="true"
                        className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    {isOpen && (
                      <div 
                        id={answerId}
                        role="region"
                        aria-labelledby={buttonId}
                        className="mt-3 text-sm text-muted-foreground leading-relaxed" 
                        suppressHydrationWarning
                      >
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}