import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShowcasesService {
  constructor(private prisma: PrismaService) {}

  async findOne(type: 'interacoustics' | 'cochlear') {
    let showcase = await this.prisma.showcase.findUnique({
      where: { type },
    });

    if (!showcase) {
      showcase = await this.prisma.showcase.create({
        data: { type, productIds: [] },
      });
    }

    const products = await this.prisma.product.findMany({
      where: { 
        id: { in: showcase.productIds },
        status: 'published', // Only return published products
      },
      include: { 
        brand: { include: { logo: true } },
        category: true,
      },
    });

    // Fetch thumbnail and gallery images for each product
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        let thumbnail = null;
        let gallery = [];

        // Fetch thumbnail if thumbnailId exists
        if (product.thumbnailId) {
          thumbnail = await this.prisma.media.findUnique({
            where: { id: product.thumbnailId },
          });
        }

        // Fetch gallery images if galleryIds exist
        if (product.galleryIds && product.galleryIds.length > 0) {
          gallery = await this.prisma.media.findMany({
            where: { id: { in: product.galleryIds } },
          });
        }

        return {
          ...product,
          thumbnail,
          gallery,
        };
      })
    );

    return { ...showcase, products: productsWithImages };
  }

  async update(type: 'interacoustics' | 'cochlear', productIds: string[]) {
    return this.prisma.showcase.upsert({
      where: { type },
      update: { productIds },
      create: { type, productIds },
    });
  }
}

