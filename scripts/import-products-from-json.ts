#!/usr/bin/env ts-node
/**
 * Import products from JSON file
 * Usage: ts-node scripts/import-products-from-json.ts <json-file-path> [--brand-name <brandName>]
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { productSchema } from '../packages/shared/src/schemas/content';

// Prisma Client automatically loads .env from the project root
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://acoustic_user:Acoustic%23%234114@localhost:5432/acousticwebdb',
    },
  },
});

interface ProductImportData {
  name_uz: string;
  name_ru: string;
  slug: string;
  description_uz?: string;
  description_ru?: string;
  price?: number;
  productType?: string;
  brandName?: string;
  intro_uz?: string;
  intro_ru?: string;
  features_uz?: string[];
  features_ru?: string[];
  benefits_uz?: string[];
  benefits_ru?: string[];
  tech_uz?: string;
  tech_ru?: string;
  specsText?: string;
  galleryUrls?: string[];
  thumbnailUrl?: string | null;
  audience?: string[];
  formFactors?: string[];
  signalProcessing?: string;
  powerLevel?: string;
  hearingLossLevels?: string[];
  smartphoneCompatibility?: string[];
  paymentOptions?: string[];
  availabilityStatus?: string;
  tinnitusSupport?: boolean;
  [key: string]: any;
}

async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    
    if (!existing) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function findBrandByName(brandName: string): Promise<string | null> {
  const brand = await prisma.brand.findFirst({
    where: {
      OR: [
        { name: { contains: brandName, mode: 'insensitive' } },
        { slug: { contains: brandName.toLowerCase().replace(/\s/g, '-'), mode: 'insensitive' } },
      ],
    },
  });
  
  return brand?.id || null;
}

async function importProducts(jsonFilePath: string, filterBrandName?: string) {
  console.log(`📂 Reading JSON file: ${jsonFilePath}`);
  
  if (!fs.existsSync(jsonFilePath)) {
    throw new Error(`File not found: ${jsonFilePath}`);
  }
  
  const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
  const products: ProductImportData[] = JSON.parse(fileContent);
  
  console.log(`📦 Found ${products.length} products in file`);
  
  if (filterBrandName) {
    console.log(`🔍 Filtering by brand: ${filterBrandName}`);
  }
  
  let success = 0;
  let skipped = 0;
  let failed = 0;
  const errors: Array<{ index: number; name: string; error: string }> = [];
  
  for (let i = 0; i < products.length; i++) {
    const productData = products[i];
    
    try {
      // Filter by brand if specified
      if (filterBrandName && productData.brandName?.toLowerCase() !== filterBrandName.toLowerCase()) {
        skipped++;
        continue;
      }
      
      // Find brand by name
      let brandId: string | null = null;
      if (productData.brandName) {
        brandId = await findBrandByName(productData.brandName);
        if (!brandId) {
          throw new Error(`Brand not found: ${productData.brandName}`);
        }
      }
      
      // Generate unique slug
      const uniqueSlug = await generateUniqueSlug(productData.slug);
      
      // Prepare product data
      const validatedData = {
        name_uz: productData.name_uz,
        name_ru: productData.name_ru,
        slug: uniqueSlug,
        description_uz: productData.description_uz || null,
        description_ru: productData.description_ru || null,
        price: productData.price || null,
        productType: productData.productType || null,
        brandId: brandId,
        intro_uz: productData.intro_uz || null,
        intro_ru: productData.intro_ru || null,
        features_uz: productData.features_uz || [],
        features_ru: productData.features_ru || [],
        benefits_uz: productData.benefits_uz || [],
        benefits_ru: productData.benefits_ru || [],
        tech_uz: productData.tech_uz || null,
        tech_ru: productData.tech_ru || null,
        specsText: productData.specsText || productData.tech_uz || null,
        galleryUrls: productData.galleryUrls || [],
        audience: productData.audience || [],
        formFactors: productData.formFactors || [],
        signalProcessing: productData.signalProcessing || null,
        powerLevel: productData.powerLevel || null,
        hearingLossLevels: productData.hearingLossLevels || [],
        smartphoneCompatibility: productData.smartphoneCompatibility || [],
        paymentOptions: productData.paymentOptions || [],
        availabilityStatus: productData.availabilityStatus || null,
        tinnitusSupport: productData.tinnitusSupport ?? false,
        status: 'published' as const,
        catalogIds: [],
        galleryIds: [],
        relatedProductIds: [],
        usefulArticleSlugs: [],
      };
      
      // Validate with schema
      const validated = productSchema.parse(validatedData);
      
      // Check if product already exists (by slug)
      const existing = await prisma.product.findUnique({
        where: { slug: uniqueSlug },
      });
      
      if (existing) {
        // Update existing product
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            name_uz: validated.name_uz,
            name_ru: validated.name_ru,
            description_uz: validated.description_uz ?? null,
            description_ru: validated.description_ru ?? null,
            price: validated.price ?? null,
            productType: validated.productType ?? null,
            brand: brandId ? { connect: { id: brandId } } : existing.brandId ? { disconnect: true } : undefined,
            intro_uz: validated.intro_uz ?? null,
            intro_ru: validated.intro_ru ?? null,
            features_uz: { set: validated.features_uz },
            features_ru: { set: validated.features_ru },
            benefits_uz: { set: validated.benefits_uz },
            benefits_ru: { set: validated.benefits_ru },
            tech_uz: validated.tech_uz ?? null,
            tech_ru: validated.tech_ru ?? null,
            specsText: validated.specsText ?? null,
            galleryUrls: { set: validated.galleryUrls },
            audience: { set: validated.audience },
            formFactors: { set: validated.formFactors },
            signalProcessing: validated.signalProcessing ?? null,
            powerLevel: validated.powerLevel ?? null,
            hearingLossLevels: { set: validated.hearingLossLevels },
            smartphoneCompatibility: { set: validated.smartphoneCompatibility },
            paymentOptions: { set: validated.paymentOptions },
            availabilityStatus: validated.availabilityStatus ?? null,
            tinnitusSupport: validated.tinnitusSupport ?? false,
            catalogs: { set: [] },
          },
        });
        console.log(`✅ Updated: ${productData.name_uz} (${i + 1}/${products.length})`);
      } else {
        // Create new product
        await prisma.product.create({
          data: {
            name_uz: validated.name_uz,
            name_ru: validated.name_ru,
            slug: uniqueSlug,
            description_uz: validated.description_uz ?? null,
            description_ru: validated.description_ru ?? null,
            price: validated.price ?? null,
            productType: validated.productType ?? null,
            brand: brandId ? { connect: { id: brandId } } : undefined,
            intro_uz: validated.intro_uz ?? null,
            intro_ru: validated.intro_ru ?? null,
            features_uz: validated.features_uz,
            features_ru: validated.features_ru,
            benefits_uz: validated.benefits_uz,
            benefits_ru: validated.benefits_ru,
            tech_uz: validated.tech_uz ?? null,
            tech_ru: validated.tech_ru ?? null,
            specsText: validated.specsText ?? null,
            galleryUrls: validated.galleryUrls,
            audience: validated.audience,
            formFactors: validated.formFactors,
            signalProcessing: validated.signalProcessing ?? null,
            powerLevel: validated.powerLevel ?? null,
            hearingLossLevels: validated.hearingLossLevels,
            smartphoneCompatibility: validated.smartphoneCompatibility,
            paymentOptions: validated.paymentOptions,
            availabilityStatus: validated.availabilityStatus ?? null,
            tinnitusSupport: validated.tinnitusSupport ?? false,
            status: 'published',
            galleryIds: [],
            relatedProductIds: [],
            usefulArticleSlugs: [],
          },
        });
        console.log(`✅ Created: ${productData.name_uz} (${i + 1}/${products.length})`);
      }
      
      success++;
    } catch (error: any) {
      failed++;
      const errorMessage = error.message || String(error);
      errors.push({
        index: i + 1,
        name: productData.name_uz || 'Unknown',
        error: errorMessage,
      });
      console.error(`❌ Failed [${i + 1}]: ${productData.name_uz} - ${errorMessage}`);
    }
  }
  
  console.log('\n📊 Import Summary:');
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.slice(0, 10).forEach((err) => {
      console.log(`   [${err.index}] ${err.name}: ${err.error}`);
    });
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`);
    }
  }
  
  return { success, skipped, failed, errors };
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: ts-node scripts/import-products-from-json.ts <json-file-path> [--brand-name <brandName>]');
    process.exit(1);
  }
  
  const jsonFilePath = path.resolve(args[0]);
  let filterBrandName: string | undefined;
  
  // Parse --brand-name argument
  const brandNameIndex = args.indexOf('--brand-name');
  if (brandNameIndex !== -1 && args[brandNameIndex + 1]) {
    filterBrandName = args[brandNameIndex + 1];
  }
  
  try {
    await importProducts(jsonFilePath, filterBrandName);
  } catch (error: any) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
