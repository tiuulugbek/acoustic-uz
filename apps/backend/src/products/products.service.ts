import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { productSchema } from '@acoustic/shared';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    status?: string;
    brandId?: string;
    categoryId?: string;
    search?: string;
    audience?: string;
    formFactor?: string;
    signalProcessing?: string;
    powerLevel?: string;
    hearingLossLevel?: string;
    smartphoneCompatibility?: string;
    paymentOption?: string;
    availabilityStatus?: string;
  }) {
    const where: Prisma.ProductWhereInput = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.brandId) where.brandId = filters.brandId;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.search) {
      where.OR = [
        { name_uz: { contains: filters.search, mode: 'insensitive' } },
        { name_ru: { contains: filters.search, mode: 'insensitive' } },
        { description_uz: { contains: filters.search, mode: 'insensitive' } },
        { description_ru: { contains: filters.search, mode: 'insensitive' } },
        { specsText: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters?.audience) where.audience = { has: filters.audience };
    if (filters?.formFactor) where.formFactors = { has: filters.formFactor };
    if (filters?.signalProcessing) where.signalProcessing = filters.signalProcessing;
    if (filters?.powerLevel) where.powerLevel = filters.powerLevel;
    if (filters?.hearingLossLevel) where.hearingLossLevels = { has: filters.hearingLossLevel };
    if (filters?.smartphoneCompatibility)
      where.smartphoneCompatibility = { has: filters.smartphoneCompatibility };
    if (filters?.paymentOption) where.paymentOptions = { has: filters.paymentOption };
    if (filters?.availabilityStatus) where.availabilityStatus = filters.availabilityStatus;

    return this.prisma.product.findMany({
      where,
      include: { brand: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { brand: true, category: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug, status: 'published' },
      include: { brand: true, category: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const relatedProducts = product.relatedProductIds.length
      ? await this.prisma.product.findMany({
          where: { id: { in: product.relatedProductIds }, status: 'published' },
          include: { brand: true, category: true },
        })
      : [];

    const usefulArticles = product.usefulArticleSlugs.length
      ? await this.prisma.post.findMany({
          where: { slug: { in: product.usefulArticleSlugs }, status: 'published' },
          select: {
            id: true,
            title_uz: true,
            title_ru: true,
            slug: true,
            excerpt_uz: true,
            excerpt_ru: true,
          },
        })
      : [];

    return {
      ...product,
      relatedProducts,
      usefulArticles,
    };
  }

  async create(data: unknown) {
    const validated = productSchema.parse(data);

    const createData: Prisma.ProductUncheckedCreateInput = {
      name_uz: validated.name_uz,
      name_ru: validated.name_ru,
      slug: validated.slug,
      description_uz: validated.description_uz ?? null,
      description_ru: validated.description_ru ?? null,
      price: validated.price ?? undefined,
      stock: validated.stock ?? undefined,
      brandId: validated.brandId ?? undefined,
      categoryId: validated.categoryId ?? undefined,
      specsText: validated.specsText ?? null,
      galleryIds: validated.galleryIds ?? [],
      audience: validated.audience ?? [],
      formFactors: validated.formFactors ?? [],
      signalProcessing: validated.signalProcessing ?? undefined,
      powerLevel: validated.powerLevel ?? undefined,
      hearingLossLevels: validated.hearingLossLevels ?? [],
      smartphoneCompatibility: validated.smartphoneCompatibility ?? [],
      tinnitusSupport:
        validated.tinnitusSupport === undefined ? undefined : validated.tinnitusSupport ?? false,
      paymentOptions: validated.paymentOptions ?? [],
      availabilityStatus: validated.availabilityStatus ?? undefined,
      intro_uz: validated.intro_uz ?? null,
      intro_ru: validated.intro_ru ?? null,
      features_uz: validated.features_uz ?? [],
      features_ru: validated.features_ru ?? [],
      benefits_uz: validated.benefits_uz ?? [],
      benefits_ru: validated.benefits_ru ?? [],
      tech_uz: validated.tech_uz ?? null,
      tech_ru: validated.tech_ru ?? null,
      fittingRange_uz: validated.fittingRange_uz ?? null,
      fittingRange_ru: validated.fittingRange_ru ?? null,
      regulatoryNote_uz: validated.regulatoryNote_uz ?? null,
      regulatoryNote_ru: validated.regulatoryNote_ru ?? null,
      galleryUrls: validated.galleryUrls ?? [],
      relatedProductIds: validated.relatedProductIds ?? [],
      usefulArticleSlugs: validated.usefulArticleSlugs ?? [],
      status: validated.status ?? 'published',
    };

    return this.prisma.product.create({
      data: createData,
      include: { brand: true, category: true },
    });
  }

  async update(id: string, data: unknown) {
    const validated = productSchema.partial().parse(data);
    const updateData: Prisma.ProductUncheckedUpdateInput = {};

    if (validated.name_uz !== undefined) updateData.name_uz = validated.name_uz;
    if (validated.name_ru !== undefined) updateData.name_ru = validated.name_ru;
    if (validated.slug !== undefined) updateData.slug = validated.slug;
    if (validated.description_uz !== undefined) updateData.description_uz = validated.description_uz ?? null;
    if (validated.description_ru !== undefined) updateData.description_ru = validated.description_ru ?? null;
    if (validated.price !== undefined) updateData.price = validated.price ?? null;
    if (validated.stock !== undefined) updateData.stock = validated.stock ?? null;
    if (validated.brandId !== undefined) updateData.brandId = validated.brandId ?? null;
    if (validated.categoryId !== undefined) updateData.categoryId = validated.categoryId ?? null;
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.specsText !== undefined) {
      updateData.specsText = validated.specsText ?? null;
    }
    if (validated.galleryIds !== undefined) {
      updateData.galleryIds = { set: validated.galleryIds };
    }
    if (validated.audience !== undefined) {
      updateData.audience = { set: validated.audience };
    }
    if (validated.formFactors !== undefined) {
      updateData.formFactors = { set: validated.formFactors };
    }
    if (validated.signalProcessing !== undefined) {
      updateData.signalProcessing = validated.signalProcessing ?? null;
    }
    if (validated.powerLevel !== undefined) {
      updateData.powerLevel = validated.powerLevel ?? null;
    }
    if (validated.hearingLossLevels !== undefined) {
      updateData.hearingLossLevels = { set: validated.hearingLossLevels };
    }
    if (validated.smartphoneCompatibility !== undefined) {
      updateData.smartphoneCompatibility = { set: validated.smartphoneCompatibility };
    }
    if (validated.tinnitusSupport !== undefined) {
      updateData.tinnitusSupport = validated.tinnitusSupport ?? false;
    }
    if (validated.paymentOptions !== undefined) {
      updateData.paymentOptions = { set: validated.paymentOptions };
    }
    if (validated.availabilityStatus !== undefined) {
      updateData.availabilityStatus = validated.availabilityStatus ?? null;
    }
    if (validated.intro_uz !== undefined) updateData.intro_uz = validated.intro_uz ?? null;
    if (validated.intro_ru !== undefined) updateData.intro_ru = validated.intro_ru ?? null;
    if (validated.features_uz !== undefined) {
      updateData.features_uz = { set: validated.features_uz };
    }
    if (validated.features_ru !== undefined) {
      updateData.features_ru = { set: validated.features_ru };
    }
    if (validated.benefits_uz !== undefined) {
      updateData.benefits_uz = { set: validated.benefits_uz };
    }
    if (validated.benefits_ru !== undefined) {
      updateData.benefits_ru = { set: validated.benefits_ru };
    }
    if (validated.tech_uz !== undefined) updateData.tech_uz = validated.tech_uz ?? null;
    if (validated.tech_ru !== undefined) updateData.tech_ru = validated.tech_ru ?? null;
    if (validated.fittingRange_uz !== undefined) updateData.fittingRange_uz = validated.fittingRange_uz ?? null;
    if (validated.fittingRange_ru !== undefined) updateData.fittingRange_ru = validated.fittingRange_ru ?? null;
    if (validated.regulatoryNote_uz !== undefined) updateData.regulatoryNote_uz = validated.regulatoryNote_uz ?? null;
    if (validated.regulatoryNote_ru !== undefined) updateData.regulatoryNote_ru = validated.regulatoryNote_ru ?? null;
    if (validated.galleryUrls !== undefined) {
      updateData.galleryUrls = { set: validated.galleryUrls };
    }
    if (validated.relatedProductIds !== undefined) {
      updateData.relatedProductIds = { set: validated.relatedProductIds };
    }
    if (validated.usefulArticleSlugs !== undefined) {
      updateData.usefulArticleSlugs = { set: validated.usefulArticleSlugs };
    }

    return this.prisma.product.update({
      where: { id },
      data: updateData,
      include: { brand: true, category: true },
    });
  }

  async delete(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}

