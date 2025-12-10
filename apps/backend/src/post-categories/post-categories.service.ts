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
    const { imageId, ...rest } = data as any;
    return this.prisma.postCategory.create({
      data: {
        ...rest,
        image: imageId ? { connect: { id: imageId } } : undefined,
      },
      include: { image: true },
    });
  }

  async update(id: string, data: unknown) {
    const { imageId, ...rest } = data as any;
    return this.prisma.postCategory.update({
      where: { id },
      data: {
        ...rest,
        image: imageId !== undefined ? (imageId ? { connect: { id: imageId } } : { disconnect: true }) : undefined,
      },
      include: { image: true },
    });
  }

  async delete(id: string) {
    return this.prisma.postCategory.delete({ where: { id } });
  }
}









