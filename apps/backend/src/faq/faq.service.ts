import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FaqService {
  constructor(private prisma: PrismaService) {}

  async findAll(publicOnly = false) {
    const where = publicOnly ? { status: 'published' } : {};
    return this.prisma.faq.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  async create(data: unknown) {
    return this.prisma.faq.create({ data: data as any });
  }

  async update(id: string, data: unknown) {
    return this.prisma.faq.update({ where: { id }, data: data as any });
  }

  async delete(id: string) {
    return this.prisma.faq.delete({ where: { id } });
  }
}

