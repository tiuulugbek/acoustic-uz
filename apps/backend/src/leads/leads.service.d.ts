import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from './telegram/telegram.service';
export declare class LeadsService {
    private prisma;
    private telegramService;
    constructor(prisma: PrismaService, telegramService: TelegramService);
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
    create(data: unknown): Promise<{
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
    update(id: string, data: {
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
    delete(id: string): Promise<{
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
}
//# sourceMappingURL=leads.service.d.ts.map