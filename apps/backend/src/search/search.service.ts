import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(q: string) {
    const query = q.trim();
    if (!query) {
      return { products: [], services: [], posts: [] };
    }

    const [products, services, posts] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          status: 'published',
          OR: [
            { name_uz: { contains: query, mode: 'insensitive' } },
            { name_ru: { contains: query, mode: 'insensitive' } },
            { description_uz: { contains: query, mode: 'insensitive' } },
            { description_ru: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { brand: true, category: true },
        take: 10,
      }),
      this.prisma.service.findMany({
        where: {
          status: 'published',
          OR: [
            { title_uz: { contains: query, mode: 'insensitive' } },
            { title_ru: { contains: query, mode: 'insensitive' } },
            { excerpt_uz: { contains: query, mode: 'insensitive' } },
            { excerpt_ru: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { cover: true },
        take: 10,
      }),
      this.prisma.post.findMany({
        where: {
          status: 'published',
          OR: [
            { title_uz: { contains: query, mode: 'insensitive' } },
            { title_ru: { contains: query, mode: 'insensitive' } },
            { body_uz: { contains: query, mode: 'insensitive' } },
            { body_ru: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { cover: true },
        take: 10,
      }),
    ]);

    return { products, services, posts };
  }
}

