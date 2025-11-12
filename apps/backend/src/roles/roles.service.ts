import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async create(data: { name: string; permissions: string[] }) {
    return this.prisma.role.create({
      data,
    });
  }

  async update(id: string, data: { name?: string; permissions?: string[] }) {
    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.role.delete({
      where: { id },
    });
  }
}

