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
    try {
      const pageData = data as any;
      // Ensure status has a default value
      if (!pageData.status) {
        pageData.status = 'draft';
      }
      return await this.prisma.page.create({ data: pageData });
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  }

  async update(id: string, data: unknown) {
    return this.prisma.page.update({ where: { id }, data: data as any });
  }

  async delete(id: string) {
    return this.prisma.page.delete({ where: { id } });
  }
}

