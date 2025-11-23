import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ShowcasesService } from './showcases.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('public', 'admin')
@Controller('showcases')
export class ShowcasesController {
  constructor(private readonly service: ShowcasesService) {}

  @Public()
  @Get(':type')
  findOne(@Param('type') type: 'interacoustics' | 'cochlear') {
    return this.service.findOne(type);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post(':type')
  @RequirePermissions('content.write')
  update(
    @Param('type') type: 'interacoustics' | 'cochlear',
    @Body() dto: { productIds: string[]; productMetadata?: Record<string, { description_uz?: string; description_ru?: string; imageId?: string }> }
  ) {
    return this.service.update(type, dto.productIds, dto.productMetadata);
  }
}

