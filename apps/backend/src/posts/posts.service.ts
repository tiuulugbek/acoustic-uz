import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(publicOnly = false) {
    const where = publicOnly ? { status: 'published' } : {};
    return this.prisma.post.findMany({
      where,
      include: { cover: true },
      orderBy: { publishAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: { cover: true },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.post.findUnique({
      where: { slug, status: 'published' },
      include: { cover: true },
    });
  }

  async create(data: unknown) {
    return this.prisma.post.create({ data: data as any, include: { cover: true } });
  }

  async update(id: string, data: unknown) {
    return this.prisma.post.update({ where: { id }, data: data as any, include: { cover: true } });
  }

  async delete(id: string) {
    return this.prisma.post.delete({ where: { id } });
  }
}

