import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AvailabilityStatusesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.availabilityStatus.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findByKey(key: string) {
    const status = await this.prisma.availabilityStatus.findUnique({
      where: { key },
    });

    if (!status) {
      throw new NotFoundException(`Availability status with key "${key}" not found`);
    }

    return status;
  }

  async create(data: Prisma.AvailabilityStatusCreateInput) {
    return this.prisma.availabilityStatus.create({
      data,
    });
  }

  async update(key: string, data: Prisma.AvailabilityStatusUpdateInput) {
    try {
      return await this.prisma.availabilityStatus.update({
        where: { key },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Availability status with key "${key}" not found`);
      }
      throw error;
    }
  }

  async delete(key: string) {
    try {
      return await this.prisma.availabilityStatus.delete({
        where: { key },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Availability status with key "${key}" not found`);
      }
      throw error;
    }
  }
}
