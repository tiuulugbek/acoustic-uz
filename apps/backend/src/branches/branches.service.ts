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
    // Log raw input data
    const rawData = data as any;
    console.log('🔍 [BRANCHES SERVICE] Raw input data:', {
      id,
      data,
      hasWorkingHours_uz: 'workingHours_uz' in rawData,
      hasWorkingHours_ru: 'workingHours_ru' in rawData,
      hasServiceIds: 'serviceIds' in rawData,
      workingHours_uz: rawData.workingHours_uz,
      workingHours_ru: rawData.workingHours_ru,
      serviceIds: rawData.serviceIds,
    });

    // Validate only non-nullable fields, but preserve all fields from raw data
    const validated = branchSchema.partial().parse(data);
    
    // Log validated data
    console.log('🔍 [BRANCHES SERVICE] Validated data:', {
      validated,
      hasWorkingHours_uz: 'workingHours_uz' in (validated as any),
      hasWorkingHours_ru: 'workingHours_ru' in (validated as any),
      hasServiceIds: 'serviceIds' in (validated as any),
      workingHours_uz: (validated as any).workingHours_uz,
      workingHours_ru: (validated as any).workingHours_ru,
      serviceIds: (validated as any).serviceIds,
    });
    
    // Build update data explicitly - use raw data values directly for workingHours and serviceIds
    const updateData: Prisma.BranchUncheckedUpdateInput = {
      ...validated,
      ...(validated.imageId !== undefined ? { imageId: validated.imageId } : {}),
    };

    // CRITICAL: Always set workingHours and serviceIds from raw data if they exist
    // This ensures empty strings are saved as null, and non-empty strings are saved as-is
    // We MUST check rawData, not validated, because validation might strip these fields
    if ('workingHours_uz' in rawData) {
      const value = rawData.workingHours_uz;
      if (value !== undefined) {
        updateData.workingHours_uz = (value && typeof value === 'string' && value.trim()) ? value.trim() : null;
      }
    }
    if ('workingHours_ru' in rawData) {
      const value = rawData.workingHours_ru;
      if (value !== undefined) {
        updateData.workingHours_ru = (value && typeof value === 'string' && value.trim()) ? value.trim() : null;
      }
    }
    if ('serviceIds' in rawData) {
      const value = rawData.serviceIds;
      if (value !== undefined) {
        updateData.serviceIds = Array.isArray(value) ? value : [];
      }
    }

    console.log('🔍 [BRANCHES SERVICE] Final update data:', {
      id,
      workingHours_uz: updateData.workingHours_uz,
      workingHours_ru: updateData.workingHours_ru,
      serviceIds: updateData.serviceIds,
      hasWorkingHours_uz: 'workingHours_uz' in updateData,
      hasWorkingHours_ru: 'workingHours_ru' in updateData,
      hasServiceIds: 'serviceIds' in updateData,
    });

    // Log the exact data being sent to Prisma
    console.log('🔍 [BRANCHES SERVICE] Prisma update data (JSON):', JSON.stringify(updateData, null, 2));

    const result = await this.prisma.branch.update({
      where: { id },
      data: updateData,
      include: { image: true },
    });

    // Fetch the updated branch directly from database to verify
    const verifyResult = await this.prisma.branch.findUnique({
      where: { id },
      select: {
        id: true,
        workingHours_uz: true,
        workingHours_ru: true,
        serviceIds: true,
      },
    });

    console.log('🔍 [BRANCHES SERVICE] Update result (from Prisma):', {
      id: result.id,
      workingHours_uz: (result as any).workingHours_uz,
      workingHours_ru: (result as any).workingHours_ru,
      serviceIds: (result as any).serviceIds,
    });

    console.log('🔍 [BRANCHES SERVICE] Verify result (direct query):', verifyResult);

    return result;
  }

  async delete(id: string) {
    return this.prisma.branch.delete({ where: { id } });
  }
}

