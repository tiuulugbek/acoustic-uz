import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { HomepageEmptyStatesService } from './homepage-empty-states.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

@ApiTags('public', 'admin')
@Controller('homepage/empty-states')
export class HomepageEmptyStatesController {
  constructor(private readonly service: HomepageEmptyStatesService) {}

  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post()
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  create(@Body() data: Prisma.HomepageEmptyStateCreateInput & { sectionKey: string }) {
    const { sectionKey, ...rest } = data;
    return this.service.upsert(sectionKey, { sectionKey, ...rest });
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':sectionKey')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  update(@Param('sectionKey') sectionKey: string, @Body() data: Prisma.HomepageEmptyStateUpdateInput) {
    return this.service.upsert(sectionKey, data as Prisma.HomepageEmptyStateCreateInput);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':sectionKey')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  delete(@Param('sectionKey') sectionKey: string) {
    return this.service.delete(sectionKey);
  }
}
