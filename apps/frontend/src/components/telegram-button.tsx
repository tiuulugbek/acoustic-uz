'use client';

import { useEffect, useState } from 'react';
import { getSettings } from '@/lib/api';
import type { SettingsResponse } from '@/lib/api';

export default function TelegramButton() {
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettings();
        if (settings.telegramButtonBotUsername) {
          // Remove @ if present
          const username = settings.telegramButtonBotUsername.replace('@', '');
          setBotUsername(username);
        }
      } catch (error) {
        console.error('Failed to fetch Telegram bot settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (isLoading || !botUsername) {
    return null;
  }

  const handleClick = () => {
    // Open Telegram bot
    window.open(`https://t.me/${botUsername}`, '_blank');
  };

  return (
    <a
      href={`https://t.me/${botUsername}`}
      onClick={(e) => {
        e.preventDefault();
        handleClick();
      }}
      className="amo-button__link fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#0088cc] focus:ring-offset-2"
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
  );
}

