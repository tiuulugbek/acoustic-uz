import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CatalogPageConfigService } from './catalog-page-config.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Prisma } from '@prisma/client';

@ApiTags('public', 'admin')
@Controller('catalog-page-config')
export class CatalogPageConfigController {
  constructor(private readonly service: CatalogPageConfigService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get catalog page config (public)' })
  get() {
    return this.service.get();
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch()
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update catalog page config' })
  update(@Body() data: Prisma.CatalogPageConfigUpdateInput) {
    return this.service.update(data);
  }
}

