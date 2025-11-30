import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class HomepageLinksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.homepageLink.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const link = await this.prisma.homepageLink.findUnique({
      where: { id },
    });

    if (!link) {
      throw new NotFoundException(`Homepage link with id "${id}" not found`);
    }

    return link;
  }

  async create(data: Prisma.HomepageLinkCreateInput) {
    return this.prisma.homepageLink.create({
      data,
    });
  }

  async update(id: string, data: Prisma.HomepageLinkUpdateInput) {
    try {
      return await this.prisma.homepageLink.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Homepage link with id "${id}" not found`);
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      return await this.prisma.homepageLink.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Homepage link with id "${id}" not found`);
      }
      throw error;
    }
  }
}
