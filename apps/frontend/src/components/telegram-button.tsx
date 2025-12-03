'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
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
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#0088cc] shadow-lg transition-all hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#0088cc] focus:ring-offset-2"
      aria-label="Telegram orqali yozish"
      title="Telegram orqali yozish"
    >
      <MessageCircle className="h-7 w-7 text-white" />
    </button>
  );
}

