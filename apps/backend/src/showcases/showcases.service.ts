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
      where: { id: { in: showcase.productIds } },
      include: { brand: true, category: true },
    });

    return { ...showcase, products };
  }

  async update(type: 'interacoustics' | 'cochlear', productIds: string[]) {
    return this.prisma.showcase.upsert({
      where: { type },
      update: { productIds },
      create: { type, productIds },
    });
  }
}

