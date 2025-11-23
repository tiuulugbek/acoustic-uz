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
  return value as Prisma.JsonValue;
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
    telegramBotToken?: string;
    telegramChatId?: string;
    brandPrimary?: string;
    brandAccent?: string;
    featureFlags?: unknown;
    socialLinks?: unknown;
    catalogHeroImageId?: string | null;
    logoId?: string | null;
    // AmoCRM settings
    amocrmDomain?: string;
    amocrmClientId?: string;
    amocrmClientSecret?: string;
    amocrmAccessToken?: string;
    amocrmRefreshToken?: string;
    amocrmPipelineId?: string;
    amocrmStatusId?: string;
  }) {
    const { featureFlags, socialLinks, catalogHeroImageId, logoId, ...rest } = data;

    const jsonFields = {
      ...(featureFlags !== undefined ? { featureFlags: toJsonValue(featureFlags) } : {}),
      ...(socialLinks !== undefined ? { socialLinks: toJsonValue(socialLinks) } : {}),
    };

    return this.prisma.setting.upsert({
      where: { id: 'singleton' },
      update: {
        ...rest,
        ...jsonFields,
        ...(catalogHeroImageId !== undefined ? { catalogHeroImageId: catalogHeroImageId || null } : {}),
        ...(logoId !== undefined ? { logoId: logoId || null } : {}),
      },
      create: {
        id: 'singleton',
        ...rest,
        ...jsonFields,
        catalogHeroImageId: catalogHeroImageId || null,
        logoId: logoId || null,
      },
      include: { catalogHeroImage: true, logo: true },
    });
  }
}

