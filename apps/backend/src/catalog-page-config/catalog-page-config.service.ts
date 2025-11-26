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
        hearingAidsTitle_uz: typeof data.hearingAidsTitle_uz === 'string' ? data.hearingAidsTitle_uz : undefined,
        hearingAidsTitle_ru: typeof data.hearingAidsTitle_ru === 'string' ? data.hearingAidsTitle_ru : undefined,
        interacousticsTitle_uz: typeof data.interacousticsTitle_uz === 'string' ? data.interacousticsTitle_uz : undefined,
        interacousticsTitle_ru: typeof data.interacousticsTitle_ru === 'string' ? data.interacousticsTitle_ru : undefined,
        accessoriesTitle_uz: typeof data.accessoriesTitle_uz === 'string' ? data.accessoriesTitle_uz : undefined,
        accessoriesTitle_ru: typeof data.accessoriesTitle_ru === 'string' ? data.accessoriesTitle_ru : undefined,
        brandTabIds: Array.isArray(data.brandTabIds) ? data.brandTabIds : [],
        brandTabOrder: Array.isArray(data.brandTabOrder) ? data.brandTabOrder : [],
      },
      update: data,
    });
  }
}

