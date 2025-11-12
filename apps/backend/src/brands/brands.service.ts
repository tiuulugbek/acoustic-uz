import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { brandSchema } from '@acoustic/shared';
import { Prisma } from '@prisma/client';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.brand.findMany({
      include: { logo: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { logo: true },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async create(data: unknown) {
    const validated = brandSchema.parse(data);
    return this.prisma.brand.create({
      data: {
        ...validated,
        logoId: validated.logoId ?? undefined,
      } as Prisma.BrandUncheckedCreateInput,
      include: { logo: true },
    });
  }

  async update(id: string, data: unknown) {
    const validated = brandSchema.partial().parse(data);
    const updateData: Prisma.BrandUncheckedUpdateInput = {
      ...validated,
      ...(validated.logoId !== undefined ? { logoId: validated.logoId } : {}),
    };

    return this.prisma.brand.update({
      where: { id },
      data: updateData,
      include: { logo: true },
    });
  }

  async delete(id: string) {
    return this.prisma.brand.delete({
      where: { id },
    });
  }
}

