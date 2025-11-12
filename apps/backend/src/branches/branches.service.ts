import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.branch.findMany({
      include: { image: true },
      orderBy: { order: 'asc' },
    });
  }

  async create(data: unknown) {
    return this.prisma.branch.create({ data: data as any, include: { image: true } });
  }

  async update(id: string, data: unknown) {
    return this.prisma.branch.update({ where: { id }, data: data as any, include: { image: true } });
  }

  async delete(id: string) {
    return this.prisma.branch.delete({ where: { id } });
  }
}

