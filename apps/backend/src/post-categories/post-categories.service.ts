import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostCategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.postCategory.findMany({
      orderBy: [{ order: 'asc' }, { name_uz: 'asc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.postCategory.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.postCategory.findFirst({
      where: { slug },
    });
  }

  async create(data: unknown) {
    return this.prisma.postCategory.create({ data: data as any });
  }

  async update(id: string, data: unknown) {
    return this.prisma.postCategory.update({ where: { id }, data: data as any });
  }

  async delete(id: string) {
    return this.prisma.postCategory.delete({ where: { id } });
  }
}




