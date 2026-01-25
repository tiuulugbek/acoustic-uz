import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';
import { diskStorage } from 'multer';
import * as path from 'path';
import { Response } from 'express';

function getUploadsTempDir(): string {
  const base = process.env.UPLOADS_DIR || path.join(__dirname, '..', '..', 'uploads');
  return path.join(base, 'temp');
}

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
      catalogId?: string;
      productType?: string;
      search?: string;
      audience?: string;
      formFactor?: string;
      signalProcessing?: string;
      powerLevel?: string;
      hearingLossLevel?: string;
      smartphoneCompatibility?: string;
      paymentOption?: string;
      availabilityStatus?: string;
      limit?: string;
      offset?: string;
      sort?: 'newest' | 'price_asc' | 'price_desc';
    },
  ) {
    const limit = filters.limit ? parseInt(filters.limit, 10) : undefined;
    const offset = filters.offset ? parseInt(filters.offset, 10) : undefined;
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
      productType?: string;
      search?: string;
      audience?: string;
      formFactor?: string;
      signalProcessing?: string;
      powerLevel?: string;
      hearingLossLevel?: string;
      smartphoneCompatibility?: string;
      paymentOption?: string;
      availabilityStatus?: string;
      limit?: string;
      offset?: string;
    },
  ) {
    const limit = filters.limit ? parseInt(filters.limit, 10) : undefined;
    const offset = filters.offset ? parseInt(filters.offset, 10) : undefined;
    return this.productsService.findAll({
      ...filters,
      limit,
      offset,
    });
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('admin/:id')
  @RequirePermissions('content.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get product by ID (supports both UUID and numericId)' })
  findOne(@Param('id') id: string) {
    // Supports both UUID (e.g., "clx123abc456") and numericId (e.g., "123")
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
  @ApiOperation({ summary: 'Update product by ID (supports both UUID and numericId)' })
  update(@Param('id') id: string, @Body() updateDto: unknown) {
    // Supports both UUID (e.g., "clx123abc456") and numericId (e.g., "123")
    return this.productsService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product by ID (supports both UUID and numericId)' })
  remove(@Param('id') id: string) {
    // Supports both UUID (e.g., "clx123abc456") and numericId (e.g., "123")
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
        destination: (req, file, cb) => cb(null, getUploadsTempDir()),
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `excel-${uniqueSuffix}${path.extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.xlsx', '.xls'];
        const ext = path.extname(file.originalname).toLowerCase();
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
    const uploadsDir = getUploadsTempDir();
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

