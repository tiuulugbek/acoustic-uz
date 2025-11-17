import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(publicOnly = false, showOnHomepage?: boolean) {
    const where: any = publicOnly ? { status: 'published' } : {};
    if (showOnHomepage !== undefined) {
      where.showOnHomepage = showOnHomepage;
    }
    return this.prisma.catalog.findMany({
      where,
      include: { image: true },
      orderBy: [{ order: 'asc' }, { name_uz: 'asc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.catalog.findUnique({
      where: { id },
      include: { image: true },
    });
  }

  async findBySlug(slug: string, publicOnly = false) {
    const where: any = { slug };
    if (publicOnly) {
      where.status = 'published';
    }
    return this.prisma.catalog.findFirst({
      where,
      include: { image: true },
    });
  }

  async create(data: unknown) {
    return this.prisma.catalog.create({
      data: data as any,
      include: { image: true },
    });
  }

  async update(id: string, data: unknown) {
    return this.prisma.catalog.update({
      where: { id },
      data: data as any,
      include: { image: true },
    });
  }

  async delete(id: string) {
    return this.prisma.catalog.delete({ where: { id } });
  }
}


