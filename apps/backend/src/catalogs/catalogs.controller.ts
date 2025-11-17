import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CatalogsService } from './catalogs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('public', 'admin')
@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly service: CatalogsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all catalogs (public)' })
  findAll(@Query('public') publicOnly?: string, @Query('showOnHomepage') showOnHomepage?: string) {
    // If no query param, return all (for admin use), otherwise filter by published status
    const publicOnlyBool = publicOnly === 'true';
    const showOnHomepageBool = showOnHomepage === 'true' ? true : showOnHomepage === 'false' ? false : undefined;
    if (publicOnly === undefined) {
      return this.service.findAll(false, showOnHomepageBool);
    }
    return this.service.findAll(publicOnlyBool, showOnHomepageBool);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('admin')
  @RequirePermissions('content.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all catalogs (admin)' })
  findAllAdmin() {
    return this.service.findAll(false);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get catalog by slug (public)' })
  findBySlug(@Param('slug') slug: string, @Query('public') publicOnly?: string) {
    return this.service.findBySlug(slug, publicOnly === 'true');
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('admin/:id')
  @RequirePermissions('content.read')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post()
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  create(@Body() dto: unknown) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: unknown) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

