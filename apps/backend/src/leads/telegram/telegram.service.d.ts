import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { SettingsService } from '../../settings/settings.service';
export declare class TelegramService {
    private configService;
    private settingsService;
    private formsBot;
    private buttonBot;
    constructor(configService: ConfigService, settingsService: SettingsService);
    /**
     * Send lead to Telegram (forms bot)
     * Used for website forms - sends to Telegram chat
     */
    sendLead(lead: {
        name: string;
        phone: string;
        email?: string;
        source?: string;
        message?: string;
        productId?: string;
    }): Promise<boolean>;
    /**
     * Get button bot instance (for webhook)
     * Used to receive messages from Telegram button bot
     */
    getButtonBot(): Promise<TelegramBot | null>;
    /**
     * Get button bot username
     */
    getButtonBotUsername(): Promise<string | null>;
    /**
     * Send lead status update to Telegram
     * Used when admin updates lead status in admin panel
     */
    sendLeadStatusUpdate(lead: {
        id: string;
        name: string;
        phone: string;
        status?: string | null;
        oldStatus?: string | null;
    }): Promise<boolean>;
    /**
     * Send lead deletion notification to Telegram
     * Used when admin deletes a lead in admin panel
     */
    sendLeadDeletion(lead: {
        id: string;
        name: string;
        phone: string;
        source?: string | null;
    }): Promise<boolean>;
}
//# sourceMappingURL=telegram.service.d.ts.map