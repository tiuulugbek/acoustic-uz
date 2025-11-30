import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CatalogPageConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne() {
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
        hearingAidsTitle_uz: data.hearingAidsTitle_uz as string | undefined,
        hearingAidsTitle_ru: data.hearingAidsTitle_ru as string | undefined,
        interacousticsTitle_uz: data.interacousticsTitle_uz as string | undefined,
        interacousticsTitle_ru: data.interacousticsTitle_ru as string | undefined,
        accessoriesTitle_uz: data.accessoriesTitle_uz as string | undefined,
        accessoriesTitle_ru: data.accessoriesTitle_ru as string | undefined,
      },
      update: data,
    });
  }
}
