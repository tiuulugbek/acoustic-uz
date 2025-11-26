import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class HomepageEmptyStatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.homepageEmptyState.findMany();
  }

  async findBySection(sectionKey: string) {
    const emptyState = await this.prisma.homepageEmptyState.findUnique({
      where: { sectionKey },
    });

    if (!emptyState) {
      throw new NotFoundException(`Homepage empty state with sectionKey "${sectionKey}" not found`);
    }

    return emptyState;
  }

  async upsert(sectionKey: string, data: Prisma.HomepageEmptyStateCreateInput) {
    return this.prisma.homepageEmptyState.upsert({
      where: { sectionKey },
      create: { sectionKey, ...data },
      update: data,
    });
  }

  async delete(sectionKey: string) {
    try {
      return await this.prisma.homepageEmptyState.delete({
        where: { sectionKey },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Homepage empty state with sectionKey "${sectionKey}" not found`);
      }
      throw error;
    }
  }
}

