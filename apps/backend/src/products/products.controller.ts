import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';

@ApiTags('public', 'admin')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all products (public)' })
  @ApiResponse({ status: 200, description: 'Mahsulotlar ro\'yxati' })
  findAll(@Query() filters: FilterProductsDto) {
    const limit = filters.limit ? parseInt(String(filters.limit), 10) : undefined;
    const offset = filters.offset ? parseInt(String(filters.offset), 10) : undefined;
    return this.productsService.findAll({
      ...filters,
      status: 'published',
      limit,
      offset,
      sort: filters.sort,
    });
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug (public)' })
  @ApiResponse({ status: 200, description: 'Mahsulot ma\'lumotlari' })
  @ApiResponse({ status: 404, description: 'Mahsulot topilmadi' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('admin')
  @RequirePermissions('content.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all products (admin)' })
  @ApiResponse({ status: 200, description: 'Mahsulotlar ro\'yxati (admin)' })
  findAllAdmin(@Query() filters: FilterProductsDto) {
    // Parse limit and offset from query string
    const parsedFilters = {
      ...filters,
      limit: filters.limit ? Number(filters.limit) : undefined,
      offset: filters.offset ? Number(filters.offset) : undefined,
    };
    return this.productsService.findAll(parsedFilters);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('admin/:id')
  @RequirePermissions('content.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get product by ID (admin)' })
  @ApiResponse({ status: 200, description: 'Mahsulot ma\'lumotlari' })
  @ApiResponse({ status: 404, description: 'Mahsulot topilmadi' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post()
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new product' })
  @ApiResponse({ status: 201, description: 'Mahsulot yaratildi' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() createDto: CreateProductDto) {
    return this.productsService.create(createDto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Mahsulot yangilandi' })
  @ApiResponse({ status: 404, description: 'Mahsulot topilmadi' })
  update(@Param('id') id: string, @Body() updateDto: UpdateProductDto) {
    return this.productsService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post('import/excel')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Import products from Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `excel-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.xlsx', '.xls'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error('Faqat Excel fayllari (.xlsx, .xls) qabul qilinadi'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('Fayl yuklanmadi');
    }

    const fs = require('fs').promises;
    const path = require('path');
    const uploadsDir = path.join(process.cwd(), 'uploads', 'temp');
    
    // Ensure uploads directory exists
    await fs.mkdir(uploadsDir, { recursive: true }).catch(() => {});
    
    const fileBuffer = await fs.readFile(file.path);
    
    try {
      const result = await this.productsService.importFromExcel(fileBuffer);
      
      // Clean up temp file
      await fs.unlink(file.path).catch(() => {});
      
      return result;
    } catch (error: any) {
      // Clean up temp file on error
      await fs.unlink(file.path).catch(() => {});
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('import/excel-template')
  @RequirePermissions('content.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download Excel template for product import' })
  async downloadExcelTemplate(@Res() res: Response) {
    const buffer = this.productsService.generateExcelTemplate();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="products-template.xlsx"');
    res.send(buffer);
  }
}

