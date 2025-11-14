import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductCategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.productCategory.findMany({
      include: { parent: true, children: true, image: true },
      orderBy: [{ order: 'asc' }, { name_uz: 'asc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.productCategory.findUnique({
      where: { id },
      include: { parent: true, children: true, image: true },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.productCategory.findFirst({
      where: { slug },
      include: { parent: true, children: true, image: true },
    });
  }

  async create(data: unknown) {
    return this.prisma.productCategory.create({ data: data as any });
  }

  async update(id: string, data: unknown) {
    return this.prisma.productCategory.update({ where: { id }, data: data as any });
  }

  async delete(id: string) {
    return this.prisma.productCategory.delete({ where: { id } });
  }
}

