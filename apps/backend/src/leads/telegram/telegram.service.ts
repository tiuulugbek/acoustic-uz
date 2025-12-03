import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { SettingsService } from '../../settings/settings.service';

@Injectable()
export class TelegramService {
  private formsBot: TelegramBot | null = null; // Bot for forms (sends to Telegram)
  private buttonBot: TelegramBot | null = null; // Bot for button (receives messages, sends to AmoCRM)

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService
  ) {}

  /**
   * Send lead to Telegram (forms bot)
   * Used for website forms - sends to Telegram chat
   */
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

      if (!this.formsBot) {
        this.formsBot = new TelegramBot(settings.telegramBotToken);
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

      await this.formsBot.sendMessage(settings.telegramChatId, message, {
        parse_mode: 'Markdown',
      });

      return true;
    } catch (error) {
      console.error('Telegram send error:', error);
      return false;
    }
  }

  /**
   * Get button bot instance (for webhook)
   * Used to receive messages from Telegram button bot
   */
  async getButtonBot(): Promise<TelegramBot | null> {
    const settings = await this.settingsService.get();

    if (!settings.telegramButtonBotToken) {
      return null;
    }

    if (!this.buttonBot) {
      this.buttonBot = new TelegramBot(settings.telegramButtonBotToken);
    }

    return this.buttonBot;
  }

  /**
   * Get button bot username
   */
  async getButtonBotUsername(): Promise<string | null> {
    const settings = await this.settingsService.get();
    return settings.telegramButtonBotUsername || null;
  }
}

