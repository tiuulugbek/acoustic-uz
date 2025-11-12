import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('public', 'admin')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all banners (public)' })
  findAll(@Query('public') publicOnly?: string, @Query('lang') lang?: string) {
    return this.bannersService.findAll(publicOnly === 'true');
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('admin')
  @RequirePermissions('content.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all banners (admin)' })
  findAllAdmin() {
    return this.bannersService.findAll(false);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get(':id')
  @RequirePermissions('content.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get banner by ID' })
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post()
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create banner' })
  create(@Body() createDto: unknown) {
    return this.bannersService.create(createDto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update banner' })
  update(@Param('id') id: string, @Body() updateDto: unknown) {
    return this.bannersService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete banner' })
  remove(@Param('id') id: string) {
    return this.bannersService.delete(id);
  }
}

