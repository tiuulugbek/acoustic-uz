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
      include: { catalogHeroImage: true, logo: true },
    });

    if (!settings) {
      settings = await this.prisma.setting.create({
        data: { id: 'singleton' },
        include: { catalogHeroImage: true, logo: true },
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
    telegramButtonBotToken?: string; // Bot token for Telegram button (sends to AmoCRM)
    telegramButtonBotUsername?: string; // Bot username for Telegram button (e.g., @yourbot)
    telegramButtonMessage_uz?: string; // Message shown in chat bubble (Uzbek)
    telegramButtonMessage_ru?: string; // Message shown in chat bubble (Russian)
    brandPrimary?: string;
    brandAccent?: string;
    featureFlags?: unknown;
    socialLinks?: unknown;
    catalogHeroImageId?: string | null;
    logoId?: string | null;
    // Sidebar settings
    sidebarSections?: unknown;
    sidebarBrandIds?: string[];
    sidebarConfigs?: unknown; // { catalog: { sections: [...], brandIds: [...] }, products: {...}, services: {...}, posts: {...} }
    // AmoCRM settings
    amocrmDomain?: string;
    amocrmClientId?: string;
    amocrmClientSecret?: string;
    amocrmAccessToken?: string;
    amocrmRefreshToken?: string;
    amocrmPipelineId?: string;
    amocrmStatusId?: string;
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
        amocrmDomain,
        amocrmClientId,
        amocrmClientSecret,
        amocrmAccessToken,
        amocrmRefreshToken,
        amocrmPipelineId,
        amocrmStatusId,
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

      // Build update object with only valid Prisma fields
      const updateData: Record<string, unknown> = {
        ...(phonePrimary !== undefined ? { phonePrimary: normalizeString(phonePrimary) } : {}),
        ...(phoneSecondary !== undefined ? { phoneSecondary: normalizeString(phoneSecondary) } : {}),
        ...(email !== undefined ? { email: normalizeString(email) } : {}),
        ...(telegramBotToken !== undefined ? { telegramBotToken: normalizeString(telegramBotToken) } : {}),
        ...(telegramChatId !== undefined ? { telegramChatId: normalizeString(telegramChatId) } : {}),
        ...(telegramButtonBotToken !== undefined ? { telegramButtonBotToken: normalizeString(telegramButtonBotToken) } : {}),
        ...(telegramButtonBotUsername !== undefined ? { telegramButtonBotUsername: normalizeString(telegramButtonBotUsername) } : {}),
        ...(telegramButtonMessage_uz !== undefined ? { telegramButtonMessage_uz: normalizeString(telegramButtonMessage_uz) } : {}),
        ...(telegramButtonMessage_ru !== undefined ? { telegramButtonMessage_ru: normalizeString(telegramButtonMessage_ru) } : {}),
        ...(brandPrimary !== undefined ? { brandPrimary } : {}),
        ...(brandAccent !== undefined ? { brandAccent } : {}),
        ...(amocrmDomain !== undefined ? { amocrmDomain } : {}),
        ...(amocrmClientId !== undefined ? { amocrmClientId } : {}),
        ...(amocrmClientSecret !== undefined ? { amocrmClientSecret } : {}),
        ...(amocrmAccessToken !== undefined ? { amocrmAccessToken } : {}),
        ...(amocrmRefreshToken !== undefined ? { amocrmRefreshToken } : {}),
        ...(amocrmPipelineId !== undefined ? { amocrmPipelineId } : {}),
        ...(amocrmStatusId !== undefined ? { amocrmStatusId } : {}),
        ...jsonFields,
        ...(catalogHeroImageId !== undefined ? { catalogHeroImageId: catalogHeroImageId || null } : {}),
        ...(logoId !== undefined ? { logoId: logoId || null } : {}),
        ...(sidebarBrandIds !== undefined ? { sidebarBrandIds: sidebarBrandIds || [] } : {}),
      };

      console.log('Update data keys:', Object.keys(updateData));

      return this.prisma.setting.upsert({
        where: { id: 'singleton' },
        update: updateData,
        create: {
          id: 'singleton',
          ...updateData,
        },
        include: { catalogHeroImage: true, logo: true },
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

