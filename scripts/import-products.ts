import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Rasmlar papkasini topish
function findImagesDirectory(): string {
  const possiblePaths = [
    path.join(process.cwd(), 'uploads', 'products'),
    path.join(process.cwd(), 'apps', 'backend', 'uploads', 'products'),
    path.join(process.cwd(), 'apps', 'frontend', 'public', 'uploads', 'products'),
  ];
  
  for (const dirPath of possiblePaths) {
    if (fs.existsSync(dirPath)) {
      return dirPath;
    }
  }
  
  return possiblePaths[0]; // Default
}

// Rasmlarni topish va Media jadvaliga qo'shish
async function findAndCreateMediaForProduct(
  productSlug: string,
  productName: string,
  imagesDir: string
): Promise<{ thumbnailId: string | null; galleryIds: string[] }> {
  const thumbnailId: string | null = null;
  const galleryIds: string[] = [];
  
  if (!fs.existsSync(imagesDir)) {
    console.log(`   ⚠️ Rasmlar papkasi topilmadi: ${imagesDir}`);
    return { thumbnailId, galleryIds };
  }
  
  // Rasmlarni topish - slug yoki nom bo'yicha
  const searchPatterns = [
    productSlug.toLowerCase(),
    productSlug.toLowerCase().replace(/-/g, '_'),
    productName.toLowerCase().replace(/\s+/g, '-'),
    productName.toLowerCase().replace(/\s+/g, '_'),
  ];
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const foundImages: string[] = [];
  
  // Barcha fayllarni o'qish
  const files = fs.readdirSync(imagesDir);
  
  for (const file of files) {
    const fileLower = file.toLowerCase();
    const ext = path.extname(fileLower);
    
    if (!imageExtensions.includes(ext)) {
      continue;
    }
    
    // Fayl nomini pattern'larga moslashtirish
    const fileNameWithoutExt = path.basename(fileLower, ext);
    
    for (const pattern of searchPatterns) {
      if (fileNameWithoutExt.includes(pattern) || pattern.includes(fileNameWithoutExt)) {
        foundImages.push(file);
        break;
      }
    }
  }
  
  // Duplikatlarni olib tashlash
  const uniqueImages = Array.from(new Set(foundImages));
  
  // Rasmlarni Media jadvaliga qo'shish
  for (const imageFile of uniqueImages) {
    const imagePath = path.join(imagesDir, imageFile);
    const imageUrl = `/uploads/products/${imageFile}`;
    
    // Media allaqachon mavjudligini tekshirish
    let media = await prisma.media.findFirst({
      where: { url: imageUrl },
    });
    
    if (!media) {
      // Fayl ma'lumotlarini olish
      const stats = fs.statSync(imagePath);
      const mimeType = getMimeType(imageFile);
      
      // Media yaratish
      media = await prisma.media.create({
        data: {
          url: imageUrl,
          filename: imageFile,
          mimeType: mimeType,
          size: stats.size,
          alt_uz: productName,
          alt_ru: productName,
        },
      });
      console.log(`   📷 Media yaratildi: ${imageFile}`);
    }
    
    galleryIds.push(media.id);
  }
  
  // Thumbnail - birinchi rasm yoki "thumbnail" so'zini o'z ichiga olgan rasm
  const thumbnailFile = uniqueImages.find(f => 
    f.toLowerCase().includes('thumbnail') || 
    f.toLowerCase().includes('thumb') ||
    f.toLowerCase().includes('main')
  ) || uniqueImages[0];
  
  if (thumbnailFile) {
    const thumbnailUrl = `/uploads/products/${thumbnailFile}`;
    const thumbnailMedia = await prisma.media.findFirst({
      where: { url: thumbnailUrl },
    });
    if (thumbnailMedia) {
      return { thumbnailId: thumbnailMedia.id, galleryIds };
    }
  }
  
  return { thumbnailId: galleryIds[0] || null, galleryIds };
}

// MIME type'ni aniqlash
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return mimeTypes[ext] || 'image/jpeg';
}

interface ProductInput {
  name_uz: string;
  name_ru: string;
  slug: string;
  description_uz?: string;
  description_ru?: string;
  price?: number;
  productType?: 'hearing-aids' | 'accessories' | 'interacoustics';
  brandName?: string;
  categoryName?: string;
  intro_uz?: string;
  intro_ru?: string;
  features_uz?: string[];
  features_ru?: string[];
  benefits_uz?: string[];
  benefits_ru?: string[];
  tech_uz?: string;
  tech_ru?: string;
  fittingRange_uz?: string;
  fittingRange_ru?: string;
  specsText?: string;
  galleryUrls?: string[];
  thumbnailUrl?: string;
  audience?: string[];
  formFactors?: string[];
  signalProcessing?: string;
  powerLevel?: string;
  hearingLossLevels?: string[];
  smartphoneCompatibility?: string[];
  tinnitusSupport?: boolean;
  paymentOptions?: string[];
  availabilityStatus?: string;
  stock?: number;
  status?: 'published' | 'draft' | 'archived';
  catalogSlugs?: string[];
  catalogNames?: string[]; // Katalog nomlari bo'yicha ham qidirish
  categorySlug?: string; // Category slug bo'yicha ham qidirish
  relatedProductSlugs?: string[];
  usefulArticleSlugs?: string[];
}

async function importProducts() {
  try {
    console.log('=== Mahsulotlarni import qilish ===\n');

    // JSON faylni o'qish
    const filePath = process.argv[2] || path.join(__dirname, '../products_example.json');
    console.log(`📂 Fayl o'qilmoqda: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Fayl topilmadi: ${filePath}`);
      console.log('\n💡 Foydalanish:');
      console.log('   npm run import-products <fayl-yoli>');
      console.log('   yoki');
      console.log('   tsx scripts/import-products.ts <fayl-yoli>');
      process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const products: ProductInput[] = JSON.parse(fileContent);

    console.log(`✅ ${products.length} ta mahsulot topildi\n`);

    // Rasmlar papkasini topish
    const imagesDir = findImagesDirectory();
    console.log(`📁 Rasmlar papkasi: ${imagesDir}`);
    if (fs.existsSync(imagesDir)) {
      const imageFiles = fs.readdirSync(imagesDir).filter(f => 
        ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(path.extname(f).toLowerCase())
      );
      console.log(`   📷 ${imageFiles.length} ta rasm topildi\n`);
    } else {
      console.log(`   ⚠️ Rasmlar papkasi topilmadi\n`);
    }

    // Brand va Category'larni olish yoki yaratish
    const brands = await prisma.brand.findMany();
    const categories = await prisma.productCategory.findMany();
    const catalogs = await prisma.catalog.findMany();

    const brandMap = new Map(brands.map(b => [b.name.toLowerCase(), b]));
    const categoryMap = new Map(categories.map(c => [c.name_uz.toLowerCase(), c]));
    const catalogMap = new Map(catalogs.map(c => [c.slug, c]));

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      console.log(`\n[${i + 1}/${products.length}] ${productData.name_uz}`);

      try {
        // Brand'ni topish yoki yaratish
        let brandId: string | null = null;
        if (productData.brandName) {
          const brandKey = productData.brandName.toLowerCase();
          let brand = brandMap.get(brandKey);
          
          if (!brand) {
            // Brand yaratish
            const brandSlug = productData.brandName.toLowerCase().replace(/\s+/g, '-');
            brand = await prisma.brand.create({
              data: {
                name: productData.brandName,
                slug: brandSlug,
              },
            });
            brandMap.set(brandKey, brand);
            console.log(`   ✅ Brand yaratildi: ${productData.brandName}`);
          }
          brandId = brand.id;
        }

        // Category'ni topish yoki yaratish
        let categoryId: string | null = null;
        
        // Avval categoryName bo'yicha qidirish
        if (productData.categoryName) {
          const categoryKey = productData.categoryName.toLowerCase();
          let category = categoryMap.get(categoryKey);
          
          if (!category && productData.categorySlug) {
            // Slug bo'yicha ham qidirish
            category = categories.find(c => c.slug === productData.categorySlug);
            if (category) {
              categoryMap.set(categoryKey, category);
            }
          }
          
          if (!category) {
            // Category yaratish
            const categorySlug = productData.categorySlug || productData.categoryName.toLowerCase().replace(/\s+/g, '-');
            category = await prisma.productCategory.create({
              data: {
                name_uz: productData.categoryName,
                name_ru: productData.categoryName, // Agar ru versiyasi bo'lmasa, uz versiyasini ishlatamiz
                slug: categorySlug,
              },
            });
            categoryMap.set(categoryKey, category);
            categories.push(category); // Yangi category'ni ro'yxatga qo'shish
            console.log(`   ✅ Category yaratildi: ${productData.categoryName}`);
          }
          categoryId = category.id;
        } else if (productData.formFactors && productData.formFactors.length > 0) {
          // Agar categoryName bo'lmasa, formFactors'dan kategoriya yaratish
          const formFactor = productData.formFactors[0]; // Birinchi formFactor'dan foydalanish
          const categoryKey = formFactor.toLowerCase();
          let category = categoryMap.get(categoryKey);
          
          if (!category) {
            // FormFactor'dan kategoriya yaratish
            const categorySlug = formFactor.toLowerCase().replace(/\s+/g, '-');
            const categoryNameUz = formFactor;
            const categoryNameRu = formFactor; // Agar ru versiyasi bo'lmasa
            
            category = await prisma.productCategory.create({
              data: {
                name_uz: categoryNameUz,
                name_ru: categoryNameRu,
                slug: categorySlug,
              },
            });
            categoryMap.set(categoryKey, category);
            categories.push(category);
            console.log(`   ✅ Category yaratildi (formFactor'dan): ${formFactor}`);
          }
          categoryId = category.id;
        }

        // Catalog ID'larni topish
        const catalogIds: string[] = [];
        
        // Slug'lar bo'yicha qidirish
        if (productData.catalogSlugs && productData.catalogSlugs.length > 0) {
          for (const catalogSlug of productData.catalogSlugs) {
            const catalog = catalogMap.get(catalogSlug);
            if (catalog) {
              catalogIds.push(catalog.id);
            } else {
              console.log(`   ⚠️ Catalog topilmadi (slug): ${catalogSlug}`);
            }
          }
        }
        
        // Nomlar bo'yicha ham qidirish va yaratish
        if (productData.catalogNames && productData.catalogNames.length > 0) {
          for (const catalogName of productData.catalogNames) {
            // Avval nom bo'yicha qidirish
            let catalog = catalogs.find(c => 
              c.name_uz.toLowerCase() === catalogName.toLowerCase() ||
              c.name_ru.toLowerCase() === catalogName.toLowerCase()
            );
            
            if (!catalog) {
              // Catalog yaratish
              const catalogSlug = catalogName.toLowerCase().replace(/\s+/g, '-');
              catalog = await prisma.catalog.create({
                data: {
                  name_uz: catalogName,
                  name_ru: catalogName,
                  slug: catalogSlug,
                  status: 'published',
                },
              });
              catalogs.push(catalog);
              catalogMap.set(catalogSlug, catalog);
              console.log(`   ✅ Catalog yaratildi: ${catalogName}`);
            }
            
            if (catalog && !catalogIds.includes(catalog.id)) {
              catalogIds.push(catalog.id);
            }
          }
        }

        // Related product ID'larni topish
        const relatedProductIds: string[] = [];
        if (productData.relatedProductSlugs && productData.relatedProductSlugs.length > 0) {
          const relatedProducts = await prisma.product.findMany({
            where: {
              slug: { in: productData.relatedProductSlugs },
            },
            select: { id: true },
          });
          relatedProductIds.push(...relatedProducts.map(p => p.id));
        }

        // Rasmlarni topish va Media jadvaliga qo'shish
        console.log(`   🔍 Rasmlarni qidirilmoqda...`);
        const { thumbnailId, galleryIds } = await findAndCreateMediaForProduct(
          productData.slug,
          productData.name_uz,
          imagesDir
        );
        
        if (thumbnailId) {
          console.log(`   ✅ Thumbnail topildi`);
        }
        if (galleryIds.length > 0) {
          console.log(`   ✅ ${galleryIds.length} ta rasm topildi`);
        }

        // Mahsulotni yaratish yoki yangilash
        const existingProduct = await prisma.product.findUnique({
          where: { slug: productData.slug },
        });

        const productPayload: any = {
          name_uz: productData.name_uz,
          name_ru: productData.name_ru,
          slug: productData.slug,
          description_uz: productData.description_uz || null,
          description_ru: productData.description_ru || null,
          price: productData.price ? new prisma.Prisma.Decimal(productData.price) : null,
          stock: productData.stock ?? null,
          brandId: brandId,
          categoryId: categoryId,
          productType: productData.productType || null,
          intro_uz: productData.intro_uz || null,
          intro_ru: productData.intro_ru || null,
          features_uz: productData.features_uz || [],
          features_ru: productData.features_ru || [],
          benefits_uz: productData.benefits_uz || [],
          benefits_ru: productData.benefits_ru || [],
          tech_uz: productData.tech_uz || null,
          tech_ru: productData.tech_ru || null,
          fittingRange_uz: productData.fittingRange_uz || null,
          fittingRange_ru: productData.fittingRange_ru || null,
          specsText: productData.specsText || null,
          galleryUrls: productData.galleryUrls || [],
          thumbnailId: thumbnailId || null,
          galleryIds: galleryIds.length > 0 ? galleryIds : (productData.galleryUrls ? [] : []),
          audience: productData.audience || [],
          formFactors: productData.formFactors || [],
          signalProcessing: productData.signalProcessing || null,
          powerLevel: productData.powerLevel || null,
          hearingLossLevels: productData.hearingLossLevels || [],
          smartphoneCompatibility: productData.smartphoneCompatibility || [],
          tinnitusSupport: productData.tinnitusSupport ?? false,
          paymentOptions: productData.paymentOptions || [],
          availabilityStatus: productData.availabilityStatus || null,
          relatedProductIds: relatedProductIds,
          usefulArticleSlugs: productData.usefulArticleSlugs || [],
          status: productData.status || 'published',
        };

        if (existingProduct) {
          // Yangilash
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: productPayload,
          });
          
          // Catalog'larni yangilash
          if (catalogIds.length > 0) {
            await prisma.product.update({
              where: { id: existingProduct.id },
              data: {
                catalogs: {
                  set: catalogIds.map(id => ({ id })),
                },
              },
            });
          }
          
          updated++;
          console.log(`   ✅ Yangilandi`);
        } else {
          // Yaratish
          const newProduct = await prisma.product.create({
            data: {
              ...productPayload,
              catalogs: catalogIds.length > 0 ? {
                connect: catalogIds.map(id => ({ id })),
              } : undefined,
            },
          });
          created++;
          console.log(`   ✅ Yaratildi`);
        }
      } catch (error: any) {
        errors++;
        console.error(`   ❌ Xatolik: ${error.message}`);
        if (error.code === 'P2002') {
          console.error(`   ⚠️ Slug allaqachon mavjud: ${productData.slug}`);
        }
      }
    }

    console.log('\n=== Natijalar ===');
    console.log(`✅ Yaratildi: ${created} ta`);
    console.log(`🔄 Yangilandi: ${updated} ta`);
    console.log(`⏭️  O'tkazib yuborildi: ${skipped} ta`);
    console.log(`❌ Xatolar: ${errors} ta`);
    console.log(`\n📊 Jami: ${products.length} ta mahsulot`);
  } catch (error: any) {
    console.error('\n❌ Xatolik:', error);
    if (error instanceof SyntaxError) {
      console.error('⚠️ JSON fayl noto\'g\'ri formatda');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Scriptni ishga tushirish
importProducts()
  .then(() => {
    console.log('\n✅ Import yakunlandi');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  });

