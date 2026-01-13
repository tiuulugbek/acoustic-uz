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
    pageUrl?: string | null;
    referer?: string | null;
  }): Promise<boolean> {
    try {
      const settings = await this.settingsService.get();

      if (!settings.telegramBotToken || !settings.telegramChatId) {
        return false;
      }

      if (!this.formsBot) {
        this.formsBot = new TelegramBot(settings.telegramBotToken);
      }

      // Format source as hashtag for better analytics
      const sourceHashtag = lead.source 
        ? `#${lead.source.replace(/[^a-zA-Z0-9_]/g, '_')}` 
        : '';

      // Extract page name from URL
      let pageInfo = '';
      if (lead.pageUrl) {
        try {
          const url = new URL(lead.pageUrl);
          const pathParts = url.pathname.split('/').filter(Boolean);
          const pageName = pathParts.length > 0 ? pathParts[0] : 'home';
          pageInfo = `📄 *Sahifa:* ${pageName}`;
          if (pathParts.length > 1) {
            pageInfo += ` (${pathParts.slice(1).join('/')})`;
          }
          pageInfo += '\n';
        } catch (e) {
          // If URL parsing fails, use pageUrl as is
          pageInfo = `📄 *Sahifa:* ${lead.pageUrl}\n`;
        }
      }

      const message = `
🆕 *Yangi so'rov*
👤 *Ism:* ${lead.name}
📞 *Telefon:* ${lead.phone}
${lead.email ? `📧 *Email:* ${lead.email}\n` : ''}
${sourceHashtag ? `${sourceHashtag}\n` : ''}
${pageInfo}
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

  /**
   * Send lead status update to Telegram
   * Used when admin updates lead status in admin panel
   */
  async sendLeadStatusUpdate(lead: {
    id: string;
    name: string;
    phone: string;
    status?: string | null;
    oldStatus?: string | null;
  }): Promise<boolean> {
    try {
      const settings = await this.settingsService.get();

      if (!settings.telegramBotToken || !settings.telegramChatId) {
        return false;
      }

      if (!this.formsBot) {
        this.formsBot = new TelegramBot(settings.telegramBotToken);
      }

      const statusLabels: Record<string, string> = {
        new: '🆕 Yangi',
        in_progress: '⏳ Ko\'rib chiqilmoqda',
        completed: '✅ Yakunlangan',
        cancelled: '❌ Bekor qilingan',
      };

      const oldStatusLabel = lead.oldStatus ? statusLabels[lead.oldStatus] || lead.oldStatus : 'Noma\'lum';
      const newStatusLabel = lead.status ? statusLabels[lead.status] || lead.status : 'Noma\'lum';

      const message = `
🔄 *Lead holati yangilandi*
👤 *Ism:* ${lead.name}
📞 *Telefon:* ${lead.phone}
📋 *Eski holat:* ${oldStatusLabel}
📋 *Yangi holat:* ${newStatusLabel}
🆔 *ID:* ${lead.id.slice(0, 8)}...
      `.trim();

      await this.formsBot.sendMessage(settings.telegramChatId, message, {
        parse_mode: 'Markdown',
      });

      return true;
    } catch (error) {
      console.error('Telegram status update error:', error);
      return false;
    }
  }

  /**
   * Send lead deletion notification to Telegram
   * Used when admin deletes a lead in admin panel
   */
  async sendLeadDeletion(lead: {
    id: string;
    name: string;
    phone: string;
    source?: string | null;
  }): Promise<boolean> {
    try {
      const settings = await this.settingsService.get();

      if (!settings.telegramBotToken || !settings.telegramChatId) {
        return false;
      }

      if (!this.formsBot) {
        this.formsBot = new TelegramBot(settings.telegramBotToken);
      }

      // Format source as hashtag
      const sourceHashtag = lead.source 
        ? `#${lead.source.replace(/[^a-zA-Z0-9_]/g, '_')}` 
        : '';

      const message = `
🗑️ *Lead o'chirildi*
👤 *Ism:* ${lead.name}
📞 *Telefon:* ${lead.phone}
${sourceHashtag ? `${sourceHashtag}\n` : ''}🆔 *ID:* ${lead.id.slice(0, 8)}...
      `.trim();

      await this.formsBot.sendMessage(settings.telegramChatId, message, {
        parse_mode: 'Markdown',
      });

      return true;
    } catch (error) {
      console.error('Telegram deletion notification error:', error);
      return false;
    }
  }
}

