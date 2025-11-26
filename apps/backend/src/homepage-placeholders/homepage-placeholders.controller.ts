import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HomepagePlaceholdersService } from './homepage-placeholders.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Prisma } from '@prisma/client';

@ApiTags('public', 'admin')
@Controller('homepage-placeholders')
export class HomepagePlaceholdersController {
  constructor(private readonly service: HomepagePlaceholdersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all homepage placeholders (public)' })
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get(':sectionKey')
  @ApiOperation({ summary: 'Get homepage placeholder by section key (public)' })
  findBySection(@Param('sectionKey') sectionKey: string) {
    return this.service.findBySection(sectionKey);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':sectionKey')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update homepage placeholder' })
  update(
    @Param('sectionKey') sectionKey: string,
    @Body() data: Prisma.HomepagePlaceholderCreateInput,
  ) {
    return this.service.upsert(sectionKey, data);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':sectionKey')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete homepage placeholder' })
  delete(@Param('sectionKey') sectionKey: string) {
    return this.service.delete(sectionKey);
  }
}

