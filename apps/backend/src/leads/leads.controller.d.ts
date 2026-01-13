import { LeadsService } from './leads.service';
import { TelegramService } from './telegram/telegram.service';
interface TelegramUpdate {
    message?: {
        chat: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
        };
        text?: string;
        contact?: {
            phone_number: string;
            first_name?: string;
        };
        from: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
        };
    };
}
export declare class LeadsController {
    private readonly leadsService;
    private readonly telegramService;
    constructor(leadsService: LeadsService, telegramService: TelegramService);
    create(createDto: unknown): Promise<{
        name: string;
        source: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string | null;
        email: string | null;
        phone: string;
        productId: string | null;
    }>;
    findAll(): Promise<{
        name: string;
        source: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string | null;
        email: string | null;
        phone: string;
        productId: string | null;
    }[]>;
    getTelegramButtonStats(): Promise<{
        total: number;
        today: number;
        thisWeek: number;
        thisMonth: number;
    }>;
    findOne(id: string): Promise<{
        name: string;
        source: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string | null;
        email: string | null;
        phone: string;
        productId: string | null;
    } | null>;
    update(id: string, updateDto: {
        status?: string;
    }): Promise<{
        name: string;
        source: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string | null;
        email: string | null;
        phone: string;
        productId: string | null;
    }>;
    remove(id: string): Promise<{
        name: string;
        source: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string | null;
        email: string | null;
        phone: string;
        productId: string | null;
    }>;
    telegramWebhook(update: TelegramUpdate): Promise<{
        ok: boolean;
    }>;
}
export {};
//# sourceMappingURL=leads.controller.d.ts.map