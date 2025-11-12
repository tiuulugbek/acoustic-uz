import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { SettingsService } from '../../settings/settings.service';

@Injectable()
export class TelegramService {
  private bot: TelegramBot | null = null;

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService
  ) {}

  async sendLead(lead: {
    name: string;
    phone: string;
    email?: string;
    source?: string;
    message?: string;
    productId?: string;
  }): Promise<boolean> {
    try {
      const settings = await this.settingsService.get();

      if (!settings.telegramBotToken || !settings.telegramChatId) {
        return false;
      }

      if (!this.bot) {
        this.bot = new TelegramBot(settings.telegramBotToken);
      }

      const message = `
🆕 *Yangi so'rov*
👤 *Ism:* ${lead.name}
📞 *Telefon:* ${lead.phone}
${lead.email ? `📧 *Email:* ${lead.email}\n` : ''}
${lead.source ? `📍 *Manba:* ${lead.source}\n` : ''}
${lead.message ? `💬 *Xabar:* ${lead.message}\n` : ''}
${lead.productId ? `🛍️ *Mahsulot ID:* ${lead.productId}\n` : ''}
      `.trim();

      await this.bot.sendMessage(settings.telegramChatId, message, {
        parse_mode: 'Markdown',
      });

      return true;
    } catch (error) {
      console.error('Telegram send error:', error);
      return false;
    }
  }
}

