import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { serviceSchema } from '@acoustic/shared';
import { Prisma } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(publicOnly = false, categoryId?: string) {
    const where: any = publicOnly ? { status: 'published' } : {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    return this.prisma.service.findMany({
      where,
      include: { cover: true, alternativeCover: true, category: true },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { cover: true, alternativeCover: true, category: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async findBySlug(slug: string) {
    const service = await this.prisma.service.findUnique({
      where: { slug, status: 'published' },
      include: { cover: true, alternativeCover: true, category: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async create(data: unknown) {
    const validated = serviceSchema.parse(data);
    return this.prisma.service.create({
      data: {
        ...validated,
        coverId: validated.coverId ?? undefined,
        alternativeCoverId: validated.alternativeCoverId ?? undefined,
        categoryId: validated.categoryId ?? undefined,
      } as Prisma.ServiceUncheckedCreateInput,
      include: { cover: true, alternativeCover: true, category: true },
    });
  }

  async update(id: string, data: unknown) {
    const validated = serviceSchema.partial().parse(data);
    const updateData: Prisma.ServiceUncheckedUpdateInput = {
      ...validated,
      ...(validated.coverId !== undefined ? { coverId: validated.coverId } : {}),
      ...(validated.alternativeCoverId !== undefined ? { alternativeCoverId: validated.alternativeCoverId } : {}),
      ...(validated.categoryId !== undefined ? { categoryId: validated.categoryId } : {}),
    };

    return this.prisma.service.update({
      where: { id },
      data: updateData,
      include: { cover: true, alternativeCover: true, category: true },
    });
  }

  async delete(id: string) {
    return this.prisma.service.delete({
      where: { id },
    });
  }
}

