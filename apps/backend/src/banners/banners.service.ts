import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { bannerSchema } from '@acoustic/shared';
import { Prisma } from '@prisma/client';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  async findAll(publicOnly = false) {
    const where = publicOnly ? { status: 'published' } : {};
    return this.prisma.banner.findMany({
      where,
      include: { image: true },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
      include: { image: true },
    });

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    return banner;
  }

  async create(data: unknown) {
    const validated = bannerSchema.parse(data);
    return this.prisma.banner.create({
      data: {
        ...validated,
        imageId: validated.imageId ?? undefined,
      } as Prisma.BannerUncheckedCreateInput,
      include: { image: true },
    });
  }

  async update(id: string, data: unknown) {
    const validated = bannerSchema.partial().parse(data);
    const updateData: Prisma.BannerUncheckedUpdateInput = {
      ...validated,
      ...(validated.imageId !== undefined ? { imageId: validated.imageId } : {}),
    };

    return this.prisma.banner.update({
      where: { id },
      data: updateData,
      include: { image: true },
    });
  }

  async delete(id: string) {
    return this.prisma.banner.delete({
      where: { id },
    });
  }
}

