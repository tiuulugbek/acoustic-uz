import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CatalogPageConfigService } from './catalog-page-config.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

@ApiTags('public', 'admin')
@Controller('catalog-page-config')
export class CatalogPageConfigController {
  constructor(private readonly service: CatalogPageConfigService) {}

  @Public()
  @Get()
  findOne() {
    return this.service.findOne();
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch()
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  update(@Body() data: Prisma.CatalogPageConfigUpdateInput) {
    return this.service.update(data);
  }
}
