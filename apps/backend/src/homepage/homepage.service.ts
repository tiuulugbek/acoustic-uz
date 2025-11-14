import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  homepageHearingAidSchema,
  homepageJourneyStepSchema,
  homepageNewsItemSchema,
  homepageServiceSchema,
} from '@acoustic/shared';

@Injectable()
export class HomepageService {
  constructor(private readonly prisma: PrismaService) {}

  private get client() {
    return this.prisma as unknown as {
      homepageHearingAid: any;
      homepageJourneyStep: any;
      homepageNewsItem: any;
      homepageService: any;
    };
  }

  async findHearingAids(publicOnly = false) {
    return this.client.homepageHearingAid.findMany({
      where: publicOnly ? { status: 'published' } : {},
      include: { image: true },
      orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async createHearingAid(data: unknown) {
    const validated = homepageHearingAidSchema.parse(data);
    return this.client.homepageHearingAid.create({
      data: {
        ...validated,
        imageId: validated.imageId ?? undefined,
      },
      include: { image: true },
    });
  }

  async updateHearingAid(id: string, data: unknown) {
    const validated = homepageHearingAidSchema.partial().parse(data);
    return this.client.homepageHearingAid.update({
      where: { id },
      data: {
        ...validated,
        ...(validated.imageId !== undefined ? { imageId: validated.imageId ?? null } : {}),
      },
      include: { image: true },
    });
  }

  async deleteHearingAid(id: string) {
    return this.client.homepageHearingAid.delete({ where: { id } });
  }

  async findJourney(publicOnly = false) {
    return this.client.homepageJourneyStep.findMany({
      where: publicOnly ? { status: 'published' } : {},
      orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async createJourneyStep(data: unknown) {
    const validated = homepageJourneyStepSchema.parse(data);
    return this.client.homepageJourneyStep.create({ data: validated });
  }

  async updateJourneyStep(id: string, data: unknown) {
    const validated = homepageJourneyStepSchema.partial().parse(data);
    return this.client.homepageJourneyStep.update({
      where: { id },
      data: validated,
    });
  }

  async deleteJourneyStep(id: string) {
    return this.client.homepageJourneyStep.delete({ where: { id } });
  }

  async findNews(publicOnly = false) {
    return this.client.homepageNewsItem.findMany({
      where: publicOnly ? { status: 'published' } : {},
      include: { post: true },
      orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async createNewsItem(data: unknown) {
    const validated = homepageNewsItemSchema.parse(data);
    return this.client.homepageNewsItem.create({
      data: {
        ...validated,
        postId: validated.postId ?? undefined,
        slug: validated.slug ?? undefined,
        publishedAt: validated.publishedAt ?? undefined,
      },
      include: { post: true },
    });
  }

  async updateNewsItem(id: string, data: unknown) {
    const validated = homepageNewsItemSchema.partial().parse(data);
    return this.client.homepageNewsItem.update({
      where: { id },
      data: {
        ...validated,
        ...(validated.postId !== undefined ? { postId: validated.postId ?? null } : {}),
        ...(validated.slug !== undefined ? { slug: validated.slug ?? null } : {}),
        ...(validated.publishedAt !== undefined
          ? { publishedAt: validated.publishedAt ?? null }
          : {}),
      },
      include: { post: true },
    });
  }

  async deleteNewsItem(id: string) {
    return this.client.homepageNewsItem.delete({ where: { id } });
  }

  async findServices(publicOnly = false) {
    return this.client.homepageService.findMany({
      where: publicOnly ? { status: 'published' } : {},
      include: { image: true },
      orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async createService(data: unknown) {
    const validated = homepageServiceSchema.parse(data);
    return this.client.homepageService.create({
      data: {
        ...validated,
        imageId: validated.imageId ?? undefined,
      },
      include: { image: true },
    });
  }

  async updateService(id: string, data: unknown) {
    const validated = homepageServiceSchema.partial().parse(data);
    return this.client.homepageService.update({
      where: { id },
      data: {
        ...validated,
        ...(validated.imageId !== undefined ? { imageId: validated.imageId ?? null } : {}),
      },
      include: { image: true },
    });
  }

  async deleteService(id: string) {
    return this.client.homepageService.delete({ where: { id } });
  }
}
