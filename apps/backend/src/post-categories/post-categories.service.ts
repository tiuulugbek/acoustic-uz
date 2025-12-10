import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostCategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(section?: string) {
    const where: any = {};
    if (section) {
      where.section = section;
    }
    return this.prisma.postCategory.findMany({
      where,
      include: { image: true },
      orderBy: [{ order: 'asc' }, { name_uz: 'asc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.postCategory.findUnique({
      where: { id },
      include: { image: true },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.postCategory.findFirst({
      where: { slug },
      include: { image: true },
    });
  }

  async create(data: unknown) {
    return this.prisma.postCategory.create({ 
      data: data as any,
      include: { image: true },
    });
  }

  async update(id: string, data: unknown) {
    return this.prisma.postCategory.update({ 
      where: { id }, 
      data: data as any,
      include: { image: true },
    });
  }

  async delete(id: string) {
    return this.prisma.postCategory.delete({ where: { id } });
  }
}









