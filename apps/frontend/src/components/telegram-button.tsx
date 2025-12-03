'use client';

import { useEffect, useState } from 'react';
import { getSettings } from '@/lib/api';
import { getLocaleFromDOM } from '@/lib/locale-client';
import type { SettingsResponse } from '@/lib/api';
import type { Locale } from '@/lib/locale';
import { Phone } from 'lucide-react';

export default function TelegramButton() {
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('1385');
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [locale, setLocale] = useState<Locale>('uz');

  // Get locale from DOM (client-side)
  useEffect(() => {
    setLocale(getLocaleFromDOM());
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log('[TelegramButton] Fetching settings...');
        const settings = await getSettings();
        console.log('[TelegramButton] Settings received:', {
          hasBotUsername: !!settings.telegramButtonBotUsername,
          botUsername: settings.telegramButtonBotUsername,
          hasMessageUz: !!settings.telegramButtonMessage_uz,
          hasMessageRu: !!settings.telegramButtonMessage_ru,
          messageUz: settings.telegramButtonMessage_uz,
          messageRu: settings.telegramButtonMessage_ru,
          phonePrimary: settings.phonePrimary,
        });
        console.log('[TelegramButton] Full settings object:', JSON.stringify(settings, null, 2));
        
        // Set phone number
        if (settings.phonePrimary) {
          setPhoneNumber(settings.phonePrimary);
        }
        
        if (settings.telegramButtonBotUsername) {
          // Remove @ if present
          const username = settings.telegramButtonBotUsername.replace('@', '');
          setBotUsername(username);
          console.log('[TelegramButton] Bot username set:', username);
          
          // Get message based on locale
          const messageText = locale === 'ru' 
            ? (settings.telegramButtonMessage_ru || 'Здравствуйте!\nУ вас есть вопрос?')
            : (settings.telegramButtonMessage_uz || 'Assalomu alaykum!\nSavolingiz bormi?');
          setMessage(messageText);
          console.log('[TelegramButton] Message set:', messageText);
        } else {
          console.warn('[TelegramButton] No bot username in settings. Component will not render.');
        }
      } catch (error) {
        console.error('[TelegramButton] Failed to fetch Telegram bot settings:', error);
      } finally {
        setIsLoading(false);
        console.log('[TelegramButton] Loading complete. isLoading:', false, 'botUsername:', botUsername);
      }
    };

    fetchSettings();
  }, [locale]);

  // Debug logging
  useEffect(() => {
    console.log('[TelegramButton] Render state:', {
      isLoading,
      botUsername,
      isVisible,
      message,
      locale,
    });
  }, [isLoading, botUsername, isVisible, message, locale]);

  // Don't render if still loading
  if (isLoading) {
    console.log('[TelegramButton] Still loading, not rendering');
    return null;
  }

  // If no bot username, don't render at all
  if (!botUsername) {
    console.warn('[TelegramButton] No bot username in settings, component will not render.');
    console.warn('[TelegramButton] Please configure telegramButtonBotUsername in admin panel settings.');
    return null;
  }

  const handleClick = () => {
    // Open Telegram bot
    window.open(`https://t.me/${botUsername}`, '_blank');
    setIsVisible(false);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Desktop: Chat Bubble and Telegram Button */}
      <div className="hidden md:block fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Chat Bubble */}
        <div className="relative max-w-xs rounded-2xl bg-white px-4 py-3 shadow-xl animate-in slide-in-from-bottom-4 fade-in">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
            aria-label="Yopish"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          
          {/* Chat bubble tail */}
          <div className="absolute bottom-0 right-6 h-4 w-4 rotate-45 bg-white"></div>
          
          {/* Message text */}
          <p className="text-sm font-medium text-gray-800 whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Telegram Button */}
        <a
          href={`https://t.me/${botUsername}`}
          onClick={(e) => {
            e.preventDefault();
            handleClick();
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#0088cc] focus:ring-offset-2 animate-in slide-in-from-bottom-4 fade-in"
          data-social="telegram"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Telegram orqali yozish"
          title="Telegram orqali yozish"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            className="h-12 w-12"
          >
            <path
              fill="#E1E1E1"
              d="M18.186 37.327c-.965 0-.8-.37-1.134-1.303l-2.838-9.488 21.85-13.165"
            />
            <path
              fill="#CDCDCD"
              d="M18.186 37.328c.745 0 1.074-.346 1.49-.757l3.973-3.923-4.956-3.035"
            />
            <path
              fill="#0088cc"
              d="m18.693 29.614 12.007 9.01c1.37.768 2.36.37 2.7-1.292l4.888-23.392c.5-2.038-.765-2.962-2.075-2.357l-28.7 11.239c-1.96.798-1.948 1.908-.357 2.403l7.365 2.334 17.05-10.925c.805-.496 1.544-.23.938.317"
            />
          </svg>
        </a>
      </div>

      {/* Mobile: Full-width Banner */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex animate-in slide-in-from-bottom-4 fade-in">
        {/* Left side: Phone number with brand color */}
        <a
          href={`tel:${phoneNumber.replace(/\s/g, '')}`}
          className="flex-1 flex items-center justify-center gap-2 bg-brand-primary/90 backdrop-blur-sm px-4 py-3 text-white transition-opacity hover:opacity-90"
          aria-label={locale === 'ru' ? 'Позвонить' : 'Qo\'ng\'iroq qilish'}
        >
          <Phone size={18} className="text-white" />
          <span className="text-lg font-bold text-white">{phoneNumber}</span>
        </a>

        {/* Right side: Appointment with Telegram color */}
        <a
          href={`https://t.me/${botUsername}`}
          onClick={(e) => {
            e.preventDefault();
            handleClick();
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-[#0088cc]/90 backdrop-blur-sm px-4 py-3 text-white transition-opacity hover:opacity-90"
          aria-label={locale === 'ru' ? 'Записаться на прием' : 'Qabulga yozilish'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-white"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.89-2.51 2.7-1.04 3.26-1.22 3.63-1.23.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
          </svg>
          <span className="text-sm font-semibold text-white whitespace-nowrap" suppressHydrationWarning>
            {locale === 'ru' ? 'Онлайн-запись' : 'Qabulga yozilish'}
          </span>
        </a>
      </div>
    </>
  );
}

