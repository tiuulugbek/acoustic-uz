import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('public', 'admin')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all services (public)' })
  findAll(@Query('public') publicOnly?: string) {
    return this.servicesService.findAll(publicOnly === 'true');
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get service by slug (public)' })
  findBySlug(@Param('slug') slug: string) {
    return this.servicesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('admin')
  @RequirePermissions('content.read')
  @ApiBearerAuth()
  findAllAdmin() {
    return this.servicesService.findAll(false);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('admin/:id')
  @RequirePermissions('content.read')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post()
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  create(@Body() createDto: unknown) {
    return this.servicesService.create(createDto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateDto: unknown) {
    return this.servicesService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.servicesService.delete(id);
  }
}

