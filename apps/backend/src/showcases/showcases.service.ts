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
        data: { type, productIds: [], productMetadata: {} },
      });
    }

    const products = await this.prisma.product.findMany({
      where: { 
        id: { in: showcase.productIds },
        status: 'published', // Only return published products
      },
      include: { 
        brand: true, 
        category: true,
      },
    });

    // Fetch Media objects for all products
    const allMediaIds = new Set<string>();
    products.forEach(product => {
      if (product.thumbnailId) allMediaIds.add(product.thumbnailId);
      product.galleryIds.forEach(id => allMediaIds.add(id));
    });

    const mediaMap = new Map<string, any>();
    if (allMediaIds.size > 0) {
      const media = await this.prisma.media.findMany({
        where: { id: { in: Array.from(allMediaIds) } },
      });
      media.forEach(m => mediaMap.set(m.id, m));
    }

    // Map products with metadata (descriptions from productMetadata)
    const productMetadata = (showcase.productMetadata as Record<string, { description_uz?: string; description_ru?: string; imageId?: string }>) || {};
    const productsWithMetadata = products.map((product) => {
      const metadata = productMetadata[product.id] || {};
      // Find homepage image if imageId is provided
      let homepageImage = null;
      if (metadata.imageId && mediaMap.has(metadata.imageId)) {
        homepageImage = mediaMap.get(metadata.imageId);
      }
      return {
        ...product,
        homepageDescription_uz: metadata.description_uz || null,
        homepageDescription_ru: metadata.description_ru || null,
        homepageImageId: metadata.imageId || null,
        homepageImage: homepageImage,
      };
    });

    return { ...showcase, products: productsWithMetadata };
  }

  async update(
    type: 'interacoustics' | 'cochlear',
    productIds: string[],
    productMetadata?: Record<string, { description_uz?: string; description_ru?: string; imageId?: string }>
  ) {
    return this.prisma.showcase.upsert({
      where: { type },
      update: {
        productIds,
        ...(productMetadata !== undefined ? { productMetadata } : {}),
      },
      create: {
        type,
        productIds,
        productMetadata: productMetadata || {},
      },
    });
  }
}

