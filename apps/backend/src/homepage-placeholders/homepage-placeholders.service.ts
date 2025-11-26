import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class HomepagePlaceholdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.homepagePlaceholder.findMany({
      include: { image: true },
    });
  }

  async findBySection(sectionKey: string) {
    const placeholder = await this.prisma.homepagePlaceholder.findUnique({
      where: { sectionKey },
      include: { image: true },
    });

    if (!placeholder) {
      throw new NotFoundException(`Homepage placeholder with sectionKey "${sectionKey}" not found`);
    }

    return placeholder;
  }

  async upsert(sectionKey: string, data: Prisma.HomepagePlaceholderCreateInput) {
    return this.prisma.homepagePlaceholder.upsert({
      where: { sectionKey },
      create: { sectionKey, ...data },
      update: data,
      include: { image: true },
    });
  }

  async delete(sectionKey: string) {
    try {
      return await this.prisma.homepagePlaceholder.delete({
        where: { sectionKey },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Homepage placeholder with sectionKey "${sectionKey}" not found`);
      }
      throw error;
    }
  }
}

