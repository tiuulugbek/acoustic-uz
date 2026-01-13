import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
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
        sidebarSections: import("@prisma/client/runtime/library").JsonValue | null;
        sidebarConfigs: import("@prisma/client/runtime/library").JsonValue | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
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
        featureFlags: import("@prisma/client/runtime/library").JsonValue | null;
        sidebarBrandIds: string[];
    }>;
    update(updateDto: unknown): Promise<{
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
        sidebarSections: import("@prisma/client/runtime/library").JsonValue | null;
        sidebarConfigs: import("@prisma/client/runtime/library").JsonValue | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
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
        featureFlags: import("@prisma/client/runtime/library").JsonValue | null;
        sidebarBrandIds: string[];
    }>;
}
//# sourceMappingURL=settings.controller.d.ts.map