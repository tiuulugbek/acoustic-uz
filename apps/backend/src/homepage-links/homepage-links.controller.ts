import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HomepageLinksService } from './homepage-links.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Prisma } from '@prisma/client';

@ApiTags('public', 'admin')
@Controller('homepage-links')
export class HomepageLinksController {
  constructor(private readonly service: HomepageLinksService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all homepage links (public)' })
  @ApiQuery({ name: 'sectionKey', required: false })
  @ApiQuery({ name: 'position', required: false })
  findAll(
    @Query('sectionKey') sectionKey?: string,
    @Query('position') position?: string,
  ) {
    return this.service.findAll(true, sectionKey, position);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get homepage link by id (public)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post()
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create homepage link' })
  create(@Body() data: Prisma.HomepageLinkCreateInput) {
    return this.service.create(data);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update homepage link' })
  update(@Param('id') id: string, @Body() data: Prisma.HomepageLinkUpdateInput) {
    return this.service.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete homepage link' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

