import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class HomepageSectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(publicOnly = false) {
    const where = publicOnly ? { status: 'published' } : {};
    return this.prisma.homepageSection.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  async findByKey(key: string) {
    const section = await this.prisma.homepageSection.findUnique({
      where: { key },
    });

    if (!section) {
      throw new NotFoundException(`Homepage section with key "${key}" not found`);
    }

    return section;
  }

  async create(data: Prisma.HomepageSectionCreateInput) {
    return this.prisma.homepageSection.create({
      data,
    });
  }

  async update(key: string, data: Prisma.HomepageSectionUpdateInput) {
    try {
      return await this.prisma.homepageSection.update({
        where: { key },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Homepage section with key "${key}" not found`);
      }
      throw error;
    }
  }

  async delete(key: string) {
    try {
      return await this.prisma.homepageSection.delete({
        where: { key },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Homepage section with key "${key}" not found`);
      }
      throw error;
    }
  }
}
