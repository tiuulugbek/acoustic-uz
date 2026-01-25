/**
 * API Example: Using numeric_id in Backend
 * 
 * Bu misol kod Variant A migration'dan keyin qanday ishlashni ko'rsatadi.
 * API'da numeric_id qabul qilinadi, ichkarida UUID'ga convert qilinadi.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// Example 1: Get Product by numeric_id
// ============================================

export async function getProductByNumericId(numericId: number) {
  // numeric_id orqali product topish
  const product = await prisma.product.findFirst({
    where: {
      numericId: numericId,
    },
    include: {
      brand: true,
      category: true,
    },
  });

  if (!product) {
    throw new Error(`Product with numeric_id ${numericId} not found`);
  }

  return product;
}

// ============================================
// Example 2: Create Product with numeric_id
// ============================================

export async function createProduct(data: {
  name_uz: string;
  name_ru: string;
  slug: string;
  // ... boshqa maydonlar
}) {
  // Prisma avtomatik numeric_id generatsiya qiladi (BIGSERIAL)
  const product = await prisma.product.create({
    data: {
      ...data,
      // numericId avtomatik yaratiladi
    },
  });

  return product;
}

// ============================================
// Example 3: Update Product by numeric_id
// ============================================

export async function updateProductByNumericId(
  numericId: number,
  data: Partial<{
    name_uz: string;
    name_ru: string;
    // ... boshqa maydonlar
  }>
) {
  // Avval product topish
  const product = await prisma.product.findFirst({
    where: { numericId },
  });

  if (!product) {
    throw new Error(`Product with numeric_id ${numericId} not found`);
  }

  // UUID orqali yangilash (ichkarida UUID ishlatiladi)
  const updated = await prisma.product.update({
    where: { id: product.id }, // UUID
    data,
  });

  return updated;
}

// ============================================
// Example 4: Delete Product by numeric_id
// ============================================

export async function deleteProductByNumericId(numericId: number) {
  // Avval product topish
  const product = await prisma.product.findFirst({
    where: { numericId },
  });

  if (!product) {
    throw new Error(`Product with numeric_id ${numericId} not found`);
  }

  // UUID orqali o'chirish
  await prisma.product.delete({
    where: { id: product.id }, // UUID
  });

  return { success: true };
}

// ============================================
// Example 5: List Products with numeric_id
// ============================================

export async function listProducts(options: {
  page?: number;
  limit?: number;
  brandId?: number; // numeric_id
  categoryId?: number; // numeric_id
}) {
  const { page = 1, limit = 20, brandId, categoryId } = options;
  const skip = (page - 1) * limit;

  // Agar brandId yoki categoryId numeric_id bo'lsa, avval UUID'ga convert qilish kerak
  let brand: { id: string } | null = null;
  let category: { id: string } | null = null;

  if (brandId) {
    brand = await prisma.brand.findFirst({
      where: { numericId: brandId },
      select: { id: true },
    });
    if (!brand) {
      throw new Error(`Brand with numeric_id ${brandId} not found`);
    }
  }

  if (categoryId) {
    category = await prisma.productCategory.findFirst({
      where: { numericId: categoryId },
      select: { id: true },
    });
    if (!category) {
      throw new Error(`Category with numeric_id ${categoryId} not found`);
    }
  }

  // Product'larni olish
  const products = await prisma.product.findMany({
    where: {
      ...(brand && { brandId: brand.id }),
      ...(category && { categoryId: category.id }),
    },
    include: {
      brand: true,
      category: true,
    },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.product.count({
    where: {
      ...(brand && { brandId: brand.id }),
      ...(category && { categoryId: category.id }),
    },
  });

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ============================================
// Example 6: Helper Function - Convert numeric_id to UUID
// ============================================

export async function getUuidByNumericId(
  tableName: string,
  numericId: number
): Promise<string | null> {
  // Dynamic table access (Prisma'da bu qiyin, lekin misol sifatida)
  const models: Record<string, any> = {
    Product: prisma.product,
    Brand: prisma.brand,
    Category: prisma.productCategory,
    Media: prisma.media,
    // ... boshqa modellar
  };

  const model = models[tableName];
  if (!model) {
    throw new Error(`Unknown table: ${tableName}`);
  }

  const record = await model.findFirst({
    where: { numericId },
    select: { id: true },
  });

  return record?.id || null;
}

// ============================================
// Example 7: NestJS Controller Example
// ============================================

/*
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

@Controller('products')
export class ProductController {
  @Get(':id')
  async getProduct(@Param('id', ParseIntPipe) numericId: number) {
    return await getProductByNumericId(numericId);
  }

  @Get()
  async listProducts(@Query() query: { page?: number; limit?: number }) {
    return await listProducts(query);
  }
}
*/

// ============================================
// Example 8: Frontend API Call Example
// ============================================

/*
// Frontend'da API chaqiruv
async function fetchProduct(numericId: number) {
  const response = await fetch(`/api/products/${numericId}`);
  const product = await response.json();
  return product;
}

// URL'da numeric_id ishlatish
// Oldin: /products/clx123abc456
// Endi:  /products/123
*/
