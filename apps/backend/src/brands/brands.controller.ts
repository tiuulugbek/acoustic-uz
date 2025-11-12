import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('public', 'admin')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all brands (public)' })
  findAll() {
    return this.brandsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('admin/:id')
  @RequirePermissions('content.read')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post()
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  create(@Body() createDto: unknown) {
    return this.brandsService.create(createDto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateDto: unknown) {
    return this.brandsService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.brandsService.delete(id);
  }
}

