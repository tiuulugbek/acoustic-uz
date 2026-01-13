import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

const toJsonValue = (value: unknown): Prisma.JsonValue | Prisma.NullTypes.JsonNull | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return Prisma.JsonNull;
  }
  // Deep clone and ensure proper JSON serialization
  try {
    // Use JSON.parse/stringify to ensure proper serialization
    // This handles nested null values correctly
    const serialized = JSON.parse(JSON.stringify(value));
    return serialized as Prisma.JsonValue;
  } catch (error) {
    console.error('JSON serialization error:', error);
    console.error('Value that failed:', value);
    // Fallback to direct cast
    return value as Prisma.JsonValue;
  }
};

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    let settings = await this.prisma.setting.findUnique({
      where: { id: 'singleton' },
      include: { catalogHeroImage: true, logo: true, favicon: true },
    });

    if (!settings) {
      settings = await this.prisma.setting.create({
        data: { id: 'singleton' },
        include: { catalogHeroImage: true, logo: true, favicon: true },
      });
    }

    return settings;
  }

  async update(data: {
    phonePrimary?: string;
    phoneSecondary?: string;
    email?: string;
    telegramBotToken?: string; // Bot token for forms (sends to Telegram)
    telegramChatId?: string; // Chat ID for forms bot
    telegramButtonBotToken?: string; // Bot token for Telegram button
    telegramButtonBotUsername?: string; // Bot username for Telegram button (e.g., @yourbot)
    telegramButtonMessage_uz?: string; // Message shown in chat bubble (Uzbek)
    telegramButtonMessage_ru?: string; // Message shown in chat bubble (Russian)
    brandPrimary?: string;
    brandAccent?: string;
    featureFlags?: unknown;
    socialLinks?: unknown;
    googleAnalyticsId?: string | null; // Google Analytics 4 Measurement ID
    yandexMetrikaId?: string | null; // Yandex Metrika Counter ID
    catalogHeroImageId?: string | null;
    logoId?: string | null;
    faviconId?: string | null;
    // Sidebar settings
    sidebarSections?: unknown;
    sidebarBrandIds?: string[];
    sidebarConfigs?: unknown; // { catalog: { sections: [...], brandIds: [...] }, products: {...}, services: {...}, posts: {...} }
  }) {
    try {
      // Extract only valid Prisma fields
      const {
        featureFlags,
        socialLinks,
        sidebarSections,
        sidebarConfigs,
        catalogHeroImageId,
        logoId,
        faviconId,
        sidebarBrandIds,
        phonePrimary,
        phoneSecondary,
        email,
        telegramBotToken,
        telegramChatId,
        telegramButtonBotToken,
        telegramButtonBotUsername,
        telegramButtonMessage_uz,
        telegramButtonMessage_ru,
        brandPrimary,
        brandAccent,
        googleAnalyticsId,
        yandexMetrikaId,
      } = data;

      // Clean sidebarConfigs: ensure proper JSON serialization
      let cleanedSidebarConfigs = sidebarConfigs;
      if (sidebarConfigs && typeof sidebarConfigs === 'object') {
        try {
          // Deep clone and ensure all values are JSON-serializable
          cleanedSidebarConfigs = JSON.parse(JSON.stringify(sidebarConfigs));
          console.log('Cleaned sidebarConfigs:', JSON.stringify(cleanedSidebarConfigs, null, 2));
        } catch (error) {
          console.error('Error cleaning sidebarConfigs:', error);
          throw new Error(`Invalid sidebarConfigs format: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      const jsonFields = {
        ...(featureFlags !== undefined ? { featureFlags: toJsonValue(featureFlags) } : {}),
        ...(socialLinks !== undefined ? { socialLinks: toJsonValue(socialLinks) } : {}),
        ...(sidebarSections !== undefined ? { sidebarSections: toJsonValue(sidebarSections) } : {}),
        ...(cleanedSidebarConfigs !== undefined ? { sidebarConfigs: toJsonValue(cleanedSidebarConfigs) } : {}),
      };
      
      console.log('JSON fields prepared:', {
        sidebarConfigs: cleanedSidebarConfigs ? 'present' : 'undefined',
        sidebarConfigsType: cleanedSidebarConfigs ? typeof cleanedSidebarConfigs : 'undefined',
      });

      // Helper function to normalize string values (empty strings become undefined)
      const normalizeString = (value: string | undefined | null): string | undefined => {
        if (value === null || value === undefined) return undefined;
        const trimmed = value.trim();
        return trimmed === '' ? undefined : trimmed;
      };

      // Debug: Log incoming values
      console.log('🔵 [Settings] Incoming values:', {
        telegramBotToken: telegramBotToken ? '***SET***' : 'undefined',
        telegramChatId: telegramChatId || 'undefined',
        telegramButtonBotToken: telegramButtonBotToken ? '***SET***' : 'undefined',
        telegramButtonBotUsername: telegramButtonBotUsername || 'undefined',
        telegramButtonMessage_uz: telegramButtonMessage_uz ? 'SET' : 'undefined',
        telegramButtonMessage_ru: telegramButtonMessage_ru ? 'SET' : 'undefined',
      });

      // Build update object with only valid Prisma fields
      // IMPORTANT: Always include fields if they are in the request, even if normalized to undefined
      // This allows clearing fields by sending empty strings
      const updateData: Record<string, unknown> = {};
      
      if (phonePrimary !== undefined) {
        const normalized = normalizeString(phonePrimary);
        if (normalized !== undefined) updateData.phonePrimary = normalized;
      }
      if (phoneSecondary !== undefined) {
        const normalized = normalizeString(phoneSecondary);
        if (normalized !== undefined) updateData.phoneSecondary = normalized;
      }
      if (email !== undefined) {
        const normalized = normalizeString(email);
        if (normalized !== undefined) updateData.email = normalized;
      }
      if (telegramBotToken !== undefined) {
        const normalized = normalizeString(telegramBotToken);
        if (normalized !== undefined) updateData.telegramBotToken = normalized;
      }
      if (telegramChatId !== undefined) {
        const normalized = normalizeString(telegramChatId);
        if (normalized !== undefined) updateData.telegramChatId = normalized;
      }
      if (telegramButtonBotToken !== undefined) {
        const normalized = normalizeString(telegramButtonBotToken);
        console.log('🔵 [Settings] telegramButtonBotToken normalized:', normalized ? '***SET***' : 'undefined');
        if (normalized !== undefined) updateData.telegramButtonBotToken = normalized;
      }
      if (telegramButtonBotUsername !== undefined) {
        const normalized = normalizeString(telegramButtonBotUsername);
        console.log('🔵 [Settings] telegramButtonBotUsername normalized:', normalized || 'undefined');
        if (normalized !== undefined) updateData.telegramButtonBotUsername = normalized;
      }
      if (telegramButtonMessage_uz !== undefined) {
        const normalized = normalizeString(telegramButtonMessage_uz);
        console.log('🔵 [Settings] telegramButtonMessage_uz normalized:', normalized ? 'SET' : 'undefined');
        if (normalized !== undefined) updateData.telegramButtonMessage_uz = normalized;
      }
      if (telegramButtonMessage_ru !== undefined) {
        const normalized = normalizeString(telegramButtonMessage_ru);
        console.log('🔵 [Settings] telegramButtonMessage_ru normalized:', normalized ? 'SET' : 'undefined');
        if (normalized !== undefined) updateData.telegramButtonMessage_ru = normalized;
      }
      
      // Add other fields
      if (brandPrimary !== undefined) updateData.brandPrimary = brandPrimary;
      if (brandAccent !== undefined) updateData.brandAccent = brandAccent;
      
      // Add JSON fields
      Object.assign(updateData, jsonFields);
      
      if (catalogHeroImageId !== undefined) updateData.catalogHeroImageId = catalogHeroImageId || null;
      if (logoId !== undefined) updateData.logoId = logoId || null;
      if (faviconId !== undefined) updateData.faviconId = faviconId || null;
      if (googleAnalyticsId !== undefined) {
        const normalized = normalizeString(googleAnalyticsId);
        updateData.googleAnalyticsId = normalized || null; // Allow clearing
      }
      if (yandexMetrikaId !== undefined) {
        const normalized = normalizeString(yandexMetrikaId);
        updateData.yandexMetrikaId = normalized || null; // Allow clearing
      }
      if (sidebarBrandIds !== undefined) updateData.sidebarBrandIds = sidebarBrandIds || [];

      console.log('🔵 [Settings] Update data keys:', Object.keys(updateData));
      console.log('🔵 [Settings] Update data values:', {
        telegramBotToken: updateData.telegramBotToken ? '***SET***' : 'undefined',
        telegramChatId: updateData.telegramChatId || 'undefined',
        telegramButtonBotToken: updateData.telegramButtonBotToken ? '***SET***' : 'undefined',
        telegramButtonBotUsername: updateData.telegramButtonBotUsername || 'undefined',
        telegramButtonMessage_uz: updateData.telegramButtonMessage_uz ? 'SET' : 'undefined',
        telegramButtonMessage_ru: updateData.telegramButtonMessage_ru ? 'SET' : 'undefined',
      });

      return this.prisma.setting.upsert({
        where: { id: 'singleton' },
        update: updateData,
        create: {
          id: 'singleton',
          ...updateData,
        },
        include: { catalogHeroImage: true, logo: true, favicon: true },
      });
    } catch (error) {
      console.error('Settings update error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Failed to update settings: ${error.message}`);
      }
      throw error;
    }
  }
}

