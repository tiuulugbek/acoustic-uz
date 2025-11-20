import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BranchesService } from './branches.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('public', 'admin')
@Controller('branches')
export class BranchesController {
  constructor(
    private readonly service: BranchesService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  async findAll() {
    // Fetch branches with all fields explicitly
    const branches = await this.prisma.branch.findMany({
      orderBy: { order: 'asc' },
      include: {
        image: true,
      },
    });
    
    // Use JSON serialization to ensure all fields are included, including nullable ones
    // This is critical for nullable fields like latitude/longitude
    const serialized = JSON.parse(JSON.stringify(branches));
    
    // Debug: Log first branch
    if (serialized.length > 0) {
      console.log('🔍 [BRANCHES] First branch after serialization:', {
        id: serialized[0].id,
        name: serialized[0].name_uz,
        latitude: serialized[0].latitude,
        longitude: serialized[0].longitude,
        hasLatitude: 'latitude' in serialized[0],
        hasLongitude: 'longitude' in serialized[0],
      });
    }
    
    return serialized;
  }

  @Public()
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { slug },
      include: {
        image: true,
      },
    } as any);

    if (!branch) {
      throw new Error('Branch not found');
    }

    // Use JSON serialization to ensure all fields are included
    return JSON.parse(JSON.stringify(branch));
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post()
  @RequirePermissions('content.write')
  create(@Body() dto: unknown) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':id')
  @RequirePermissions('content.write')
  update(@Param('id') id: string, @Body() dto: unknown) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':id')
  @RequirePermissions('content.write')
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
