#!/usr/bin/env node
/**
 * Signia mahsulotlarini JSON fayldan import qilish
 * Usage: node scripts/import-signia-product.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://acoustic_user:Acoustic%23%234114@localhost:5432/acousticwebdb',
    },
  },
});

async function generateUniqueSlug(baseSlug) {
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

async function findBrandByName(brandName) {
  const brand = await prisma.brand.findFirst({
    where: {
      OR: [
        { name: { contains: brandName, mode: 'insensitive' } },
        { slug: { contains: brandName.toLowerCase().replace(/\s/g, '-'), mode: 'insensitive' } },
      ],
    },
  });
  
  return brand;
}

async function importProducts() {
  const jsonFile = '/root/signia-product.json';
  
  console.log(`📂 JSON faylni o'qiyapman: ${jsonFile}`);
  
  if (!fs.existsSync(jsonFile)) {
    throw new Error(`Fayl topilmadi: ${jsonFile}`);
  }
  
  const fileContent = fs.readFileSync(jsonFile, 'utf-8');
  const products = JSON.parse(fileContent);
  
  if (!Array.isArray(products)) {
    throw new Error('JSON fayl array bo\'lishi kerak');
  }
  
  console.log(`📦 Faylda ${products.length} ta mahsulot topildi`);
  console.log('');
  
  // Signia brendini topish
  const brand = await findBrandByName('Signia');
  
  if (!brand) {
    throw new Error('Signia brend topilmadi! Avval brendni yaratishingiz kerak.');
  }
  
  console.log(`✅ Brand topildi: ${brand.name} (ID: ${brand.id})`);
  console.log('');
  
  let success = 0;
  let updated = 0;
  let failed = 0;
  const errors = [];
  
  for (let i = 0; i < products.length; i++) {
    const productData = products[i];
    
    try {
      // Brand filtrlash
      if (productData.brandName && productData.brandName.toLowerCase() !== 'signia') {
        continue;
      }
      
      // Slug yaratish
      let baseSlug = productData.slug || productData.name_uz.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      
      const uniqueSlug = await generateUniqueSlug(baseSlug);
      
      // Ma'lumotlarni tayyorlash
      const data = {
        name_uz: productData.name_uz,
        name_ru: productData.name_ru,
        slug: uniqueSlug,
        description_uz: productData.description_uz || null,
        description_ru: productData.description_ru || null,
        price: (() => {
          if (!productData.price) return null;
          let price = parseFloat(productData.price);
          if (isNaN(price) || price < 0) return null;
          
          // Decimal(14, 2) formatida maksimal qiymat: 99999999999999.99
          const MAX_PRICE = 99999999999999.99;
          
          // Narxlar to'g'ridan-to'g'ri UZS so'm formatida (masalan: 19500000)
          // Hech qanday o'zgartirish qilmaymiz
          
          if (price > MAX_PRICE) {
            console.warn(`⚠️  Narx juda katta: ${price} -> null qilindi`);
            return null;
          }
          
          return price;
        })(),
        productType: productData.productType || 'hearing-aids',
        brand: {
          connect: { id: brand.id }
        },
        intro_uz: productData.intro_uz || null,
        intro_ru: productData.intro_ru || null,
        features_uz: productData.features_uz || [],
        features_ru: productData.features_ru || [],
        benefits_uz: productData.benefits_uz || [],
        benefits_ru: productData.benefits_ru || [],
        tech_uz: productData.tech_uz || null,
        tech_ru: productData.tech_ru || null,
        specsText: productData.specsText || null,
        galleryIds: productData.galleryUrls || [],
        thumbnailId: productData.thumbnailUrl || null,
        audience: productData.audience || [],
        formFactors: productData.formFactors || [],
        signalProcessing: productData.signalProcessing || null,
        powerLevel: productData.powerLevel || null,
        hearingLossLevels: productData.hearingLossLevels || [],
        smartphoneCompatibility: productData.smartphoneCompatibility || [],
        paymentOptions: productData.paymentOptions || [],
        availabilityStatus: productData.availabilityStatus || null,
        tinnitusSupport: productData.tinnitusSupport ?? false,
        status: 'archived', // Signia mahsulotlari arxiv holatida
      };
      
      // Mavjud mahsulotni tekshirish
      const existing = await prisma.product.findUnique({
        where: { slug: uniqueSlug },
      });
      
      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data,
        });
        console.log(`🔄 Updated [${i + 1}/${products.length}]: ${productData.name_uz}`);
        updated++;
      } else {
        await prisma.product.create({
          data,
        });
        console.log(`✅ Created [${i + 1}/${products.length}]: ${productData.name_uz}`);
        success++;
      }
      
    } catch (error) {
      failed++;
      const errorMessage = error.message || String(error);
      errors.push({
        index: i + 1,
        name: productData.name_uz || 'Unknown',
        error: errorMessage,
      });
      console.error(`❌ Failed [${i + 1}/${products.length}]: ${productData.name_uz} - ${errorMessage}`);
    }
  }
  
  console.log('');
  console.log('📊 Import Summary:');
  console.log(`   ✅ Created: ${success}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📦 Total: ${products.length}`);
  
  if (errors.length > 0) {
    console.log('');
    console.log('❌ Errors:');
    errors.slice(0, 10).forEach((err) => {
      console.log(`   [${err.index}] ${err.name}: ${err.error}`);
    });
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`);
    }
  }
}

async function main() {
  try {
    await importProducts();
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
