import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async findBySlug(slug: string) {
    return this.prisma.page.findUnique({
      where: { slug, status: 'published' },
    });
  }

  async findAll() {
    return this.prisma.page.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: unknown) {
    return this.prisma.page.create({ data: data as any });
  }

  async update(id: string, data: unknown) {
    return this.prisma.page.update({ where: { id }, data: data as any });
  }

  async delete(id: string) {
    return this.prisma.page.delete({ where: { id } });
  }
}

