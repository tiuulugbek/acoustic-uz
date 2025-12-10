import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(publicOnly = false, category?: string, postType?: string) {
    const where: any = publicOnly ? { status: 'published' } : {};
    if (category) {
      where.categoryId = category;
    }
    if (postType) {
      where.postType = postType;
    }
    return this.prisma.post.findMany({
      where,
      include: { cover: true, category: true, author: { include: { image: true } } },
      orderBy: { publishAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: { cover: true, category: true, author: { include: { image: true } } },
    });
  }

  async findBySlug(slug: string, publicOnly = true) {
    return this.prisma.post.findFirst({
      where: { 
        slug,
        ...(publicOnly && { status: 'published' }),
      },
      include: { cover: true, category: true, author: { include: { image: true } } },
    });
  }

  async create(data: unknown) {
    return this.prisma.post.create({ 
      data: data as any, 
      include: { cover: true, category: true, author: { include: { image: true } } } 
    });
  }

  async update(id: string, data: unknown) {
    return this.prisma.post.update({ 
      where: { id }, 
      data: data as any, 
      include: { cover: true, category: true, author: { include: { image: true } } } 
    });
  }

  async delete(id: string) {
    return this.prisma.post.delete({ where: { id } });
  }
}

