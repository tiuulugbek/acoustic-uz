import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async findBySlug(slug: string, includeDraft = false) {
    const where: any = { slug };
    if (!includeDraft) {
      where.status = 'published';
    }
    
    const page = await this.prisma.page.findFirst({
      where,
    });

    if (!page) {
      return null;
    }

    // Fetch gallery media objects
    const galleryIds = page.galleryIds || [];
    const galleryMedia = galleryIds.length > 0
      ? await this.prisma.media.findMany({
          where: { id: { in: galleryIds } },
        })
      : [];

    // Return page with gallery media
    return {
      ...page,
      gallery: galleryMedia,
    };
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

