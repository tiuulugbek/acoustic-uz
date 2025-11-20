import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { doctorSchema } from '@acoustic/shared';
import { Prisma } from '@prisma/client';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(publicOnly = false) {
    const where: any = publicOnly ? { status: 'published' } : {};
    return this.prisma.doctor.findMany({
      where,
      include: { image: true },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { image: true },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async findBySlug(slug: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { slug, status: 'published' },
      include: { image: true },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async create(data: unknown) {
    const validated = doctorSchema.parse(data);
    return this.prisma.doctor.create({
      data: {
        ...validated,
        imageId: validated.imageId ?? undefined,
      } as Prisma.DoctorUncheckedCreateInput,
      include: { image: true },
    });
  }

  async update(id: string, data: unknown) {
    const validated = doctorSchema.partial().parse(data);
    const updateData: Prisma.DoctorUncheckedUpdateInput = {
      ...validated,
      ...(validated.imageId !== undefined ? { imageId: validated.imageId } : {}),
    };

    return this.prisma.doctor.update({
      where: { id },
      data: updateData,
      include: { image: true },
    });
  }

  async delete(id: string) {
    return this.prisma.doctor.delete({
      where: { id },
    });
  }
}

