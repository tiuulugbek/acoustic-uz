import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceCategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(publicOnly = false) {
    const where = publicOnly ? { status: 'published' } : {};
    const include: any = { 
      parent: true, 
      children: true, 
      image: true,
      services: {
        include: { cover: true },
        orderBy: { order: 'asc' },
        ...(publicOnly ? { where: { status: 'published' } } : {}),
      },
    };
    return this.prisma.serviceCategory.findMany({
      where,
      include,
      orderBy: [{ order: 'asc' }, { name_uz: 'asc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.serviceCategory.findUnique({
      where: { id },
      include: { 
        parent: true, 
        children: true, 
        image: true, 
        services: {
          include: { cover: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findBySlug(slug: string, publicOnly = false) {
    const where: any = { slug };
    if (publicOnly) {
      where.status = 'published';
    }
    return this.prisma.serviceCategory.findFirst({
      where,
      include: { 
        parent: true, 
        children: true, 
        image: true, 
        services: {
          include: { cover: true },
          orderBy: { order: 'asc' },
          ...(publicOnly ? { where: { status: 'published' } } : {}),
        },
      },
    });
  }

  async create(data: unknown) {
    return this.prisma.serviceCategory.create({ 
      data: data as any,
      include: { parent: true, children: true, image: true, services: true },
    });
  }

  async update(id: string, data: unknown) {
    return this.prisma.serviceCategory.update({ 
      where: { id }, 
      data: data as any,
      include: { parent: true, children: true, image: true, services: true },
    });
  }

  async delete(id: string) {
    return this.prisma.serviceCategory.delete({ where: { id } });
  }
}

