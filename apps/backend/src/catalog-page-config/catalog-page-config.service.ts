import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CatalogPageConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    let config = await this.prisma.catalogPageConfig.findUnique({
      where: { id: 'singleton' },
    });

    if (!config) {
      config = await this.prisma.catalogPageConfig.create({
        data: { id: 'singleton' },
      });
    }

    return config;
  }

  async update(data: Prisma.CatalogPageConfigUpdateInput) {
    return this.prisma.catalogPageConfig.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        heroTitle_uz: typeof data.heroTitle_uz === 'string' ? data.heroTitle_uz : undefined,
        heroTitle_ru: typeof data.heroTitle_ru === 'string' ? data.heroTitle_ru : undefined,
        heroDescription_uz: typeof data.heroDescription_uz === 'string' ? data.heroDescription_uz : undefined,
        heroDescription_ru: typeof data.heroDescription_ru === 'string' ? data.heroDescription_ru : undefined,
      },
      update: data,
    });
  }
}

