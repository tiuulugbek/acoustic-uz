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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Bubble - Desktop only */}
      <div className="hidden md:block relative max-w-xs rounded-2xl bg-white px-4 py-3 shadow-xl animate-in slide-in-from-bottom-4 fade-in">
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

      {/* Mobile Appointment Button */}
      <div className="md:hidden">
        <a
          href={`https://t.me/${botUsername}`}
          onClick={(e) => {
            e.preventDefault();
            handleClick();
          }}
          className="flex items-center gap-2 rounded-full bg-[hsl(var(--brand-primary))] px-4 py-2.5 shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-primary))] focus:ring-offset-2 animate-in slide-in-from-bottom-4 fade-in"
          aria-label={locale === 'ru' ? 'Записаться на прием' : 'Qabulga yozilish'}
        >
          <span className="text-sm font-semibold text-white whitespace-nowrap" suppressHydrationWarning>
            {locale === 'ru' ? 'Онлайн-запись' : 'Qabulga yozilish'}
          </span>
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-1">
            <Phone size={14} className="text-white" />
            <span className="text-sm font-bold text-white">{phoneNumber}</span>
          </div>
        </a>
      </div>

      {/* Telegram Button - Desktop only */}
      <a
        href={`https://t.me/${botUsername}`}
        onClick={(e) => {
          e.preventDefault();
          handleClick();
        }}
        className="hidden md:flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#0088cc] focus:ring-offset-2 animate-in slide-in-from-bottom-4 fade-in"
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
  );
}

