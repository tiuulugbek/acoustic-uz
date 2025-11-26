import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CommonTextsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string) {
    const where: Prisma.CommonTextWhereInput = {};
    if (category) {
      where.category = category;
    }
    return this.prisma.commonText.findMany({
      where,
      orderBy: { key: 'asc' },
    });
  }

  async findByKey(key: string) {
    const text = await this.prisma.commonText.findUnique({
      where: { key },
    });

    if (!text) {
      throw new NotFoundException(`Common text with key "${key}" not found`);
    }

    return text;
  }

  async upsert(key: string, data: Prisma.CommonTextCreateInput) {
    return this.prisma.commonText.upsert({
      where: { key },
      create: { key, ...data },
      update: data,
    });
  }

  async delete(key: string) {
    try {
      return await this.prisma.commonText.delete({
        where: { key },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Common text with key "${key}" not found`);
      }
      throw error;
    }
  }
}

