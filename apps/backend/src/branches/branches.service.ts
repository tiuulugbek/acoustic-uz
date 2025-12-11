import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { branchSchema } from '@acoustic/shared';
import { Prisma } from '@prisma/client';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const branches = await this.prisma.branch.findMany({
      orderBy: { order: 'asc' },
    });
    
    // Convert to plain objects using JSON serialization to ensure all fields are included
    const plainBranches = branches.map(b => JSON.parse(JSON.stringify(b)));
    
    // Load images separately
    const branchesWithImages = await Promise.all(
      plainBranches.map(async (branch: any) => {
        const image = branch.imageId
          ? await this.prisma.media.findUnique({ where: { id: branch.imageId } })
          : null;
        
        return {
          ...branch,
          image: image ? JSON.parse(JSON.stringify(image)) : null,
        };
      })
    );
    
    return branchesWithImages;
  }

  async create(data: unknown) {
    const validated = branchSchema.parse(data);
    return this.prisma.branch.create({
      data: {
        ...validated,
        imageId: validated.imageId ?? undefined,
      } as Prisma.BranchUncheckedCreateInput,
      include: { image: true },
    });
  }

  async update(id: string, data: unknown) {
    const validated = branchSchema.partial().parse(data);
    const updateData: Prisma.BranchUncheckedUpdateInput = {
      ...validated,
      ...(validated.imageId !== undefined ? { imageId: validated.imageId } : {}),
    };

    return this.prisma.branch.update({
      where: { id },
      data: updateData,
      include: { image: true },
    });
  }

  async delete(id: string) {
    return this.prisma.branch.delete({ where: { id } });
  }
}

