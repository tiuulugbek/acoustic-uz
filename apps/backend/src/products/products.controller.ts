import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('public', 'admin')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all products (public)' })
  findAll(
    @Query()
    filters: {
      status?: string;
      brandId?: string;
      categoryId?: string;
      search?: string;
      audience?: string;
      formFactor?: string;
      signalProcessing?: string;
      powerLevel?: string;
      hearingLossLevel?: string;
      smartphoneCompatibility?: string;
      paymentOption?: string;
      availabilityStatus?: string;
    },
  ) {
    return this.productsService.findAll({ ...filters, status: 'published' });
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug (public)' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('admin')
  @RequirePermissions('content.read')
  @ApiBearerAuth()
  findAllAdmin(
    @Query()
    filters: {
      status?: string;
      brandId?: string;
      categoryId?: string;
      search?: string;
      audience?: string;
      formFactor?: string;
      signalProcessing?: string;
      powerLevel?: string;
      hearingLossLevel?: string;
      smartphoneCompatibility?: string;
      paymentOption?: string;
      availabilityStatus?: string;
    },
  ) {
    return this.productsService.findAll(filters);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('admin/:id')
  @RequirePermissions('content.read')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post()
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  create(@Body() createDto: unknown) {
    return this.productsService.create(createDto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateDto: unknown) {
    return this.productsService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}

