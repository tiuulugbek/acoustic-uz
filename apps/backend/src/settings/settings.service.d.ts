import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    get(): Promise<{
        logo: {
            id: string;
            size: number | null;
            createdAt: Date;
            updatedAt: Date;
            alt_uz: string | null;
            alt_ru: string | null;
            url: string;
            filename: string | null;
            mimeType: string | null;
        } | null;
        catalogHeroImage: {
            id: string;
            size: number | null;
            createdAt: Date;
            updatedAt: Date;
            alt_uz: string | null;
            alt_ru: string | null;
            url: string;
            filename: string | null;
            mimeType: string | null;
        } | null;
        favicon: {
            id: string;
            size: number | null;
            createdAt: Date;
            updatedAt: Date;
            alt_uz: string | null;
            alt_ru: string | null;
            url: string;
            filename: string | null;
            mimeType: string | null;
        } | null;
    } & {
        id: string;
        updatedAt: Date;
        email: string | null;
        logoId: string | null;
        sidebarSections: Prisma.JsonValue | null;
        sidebarConfigs: Prisma.JsonValue | null;
        socialLinks: Prisma.JsonValue | null;
        phonePrimary: string | null;
        phoneSecondary: string | null;
        brandPrimary: string | null;
        brandAccent: string | null;
        catalogHeroImageId: string | null;
        faviconId: string | null;
        telegramBotToken: string | null;
        telegramChatId: string | null;
        telegramButtonBotToken: string | null;
        telegramButtonBotUsername: string | null;
        telegramButtonMessage_uz: string | null;
        telegramButtonMessage_ru: string | null;
        featureFlags: Prisma.JsonValue | null;
        sidebarBrandIds: string[];
    }>;
    update(data: {
        phonePrimary?: string;
        phoneSecondary?: string;
        email?: string;
        telegramBotToken?: string;
        telegramChatId?: string;
        telegramButtonBotToken?: string;
        telegramButtonBotUsername?: string;
        telegramButtonMessage_uz?: string;
        telegramButtonMessage_ru?: string;
        brandPrimary?: string;
        brandAccent?: string;
        featureFlags?: unknown;
        socialLinks?: unknown;
        catalogHeroImageId?: string | null;
        logoId?: string | null;
        faviconId?: string | null;
        sidebarSections?: unknown;
        sidebarBrandIds?: string[];
        sidebarConfigs?: unknown;
    }): Promise<{
        logo: {
            id: string;
            size: number | null;
            createdAt: Date;
            updatedAt: Date;
            alt_uz: string | null;
            alt_ru: string | null;
            url: string;
            filename: string | null;
            mimeType: string | null;
        } | null;
        catalogHeroImage: {
            id: string;
            size: number | null;
            createdAt: Date;
            updatedAt: Date;
            alt_uz: string | null;
            alt_ru: string | null;
            url: string;
            filename: string | null;
            mimeType: string | null;
        } | null;
        favicon: {
            id: string;
            size: number | null;
            createdAt: Date;
            updatedAt: Date;
            alt_uz: string | null;
            alt_ru: string | null;
            url: string;
            filename: string | null;
            mimeType: string | null;
        } | null;
    } & {
        id: string;
        updatedAt: Date;
        email: string | null;
        logoId: string | null;
        sidebarSections: Prisma.JsonValue | null;
        sidebarConfigs: Prisma.JsonValue | null;
        socialLinks: Prisma.JsonValue | null;
        phonePrimary: string | null;
        phoneSecondary: string | null;
        brandPrimary: string | null;
        brandAccent: string | null;
        catalogHeroImageId: string | null;
        faviconId: string | null;
        telegramBotToken: string | null;
        telegramChatId: string | null;
        telegramButtonBotToken: string | null;
        telegramButtonBotUsername: string | null;
        telegramButtonMessage_uz: string | null;
        telegramButtonMessage_ru: string | null;
        featureFlags: Prisma.JsonValue | null;
        sidebarBrandIds: string[];
    }>;
}
//# sourceMappingURL=settings.service.d.ts.map