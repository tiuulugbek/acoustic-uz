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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HomepageSectionsService } from './homepage-sections.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Prisma } from '@prisma/client';

@ApiTags('public', 'admin')
@Controller('homepage-sections')
export class HomepageSectionsController {
  constructor(private readonly service: HomepageSectionsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all homepage sections (public)' })
  findAll() {
    return this.service.findAll(true);
  }

  @Public()
  @Get(':key')
  @ApiOperation({ summary: 'Get homepage section by key (public)' })
  findByKey(@Param('key') key: string) {
    return this.service.findByKey(key);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post()
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create homepage section' })
  create(@Body() data: Prisma.HomepageSectionCreateInput) {
    return this.service.create(data);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':key')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update homepage section' })
  update(@Param('key') key: string, @Body() data: Prisma.HomepageSectionUpdateInput) {
    return this.service.update(key, data);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':key')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete homepage section' })
  delete(@Param('key') key: string) {
    return this.service.delete(key);
  }
}

