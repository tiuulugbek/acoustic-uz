/**
 * Mahsulotlarni JSON fayldan import qilish va rasmlarni lokalga yuklab olish
 * 
 * Qanday ishlatish:
 * npm run import:products:with-images <json-file-path>
 * 
 * Misol:
 * npm run import:products:with-images products_update.json
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

interface ProductImport {
  name_uz: string;
  name_ru: string;
  slug: string;
  description_uz?: string | null;
  description_ru?: string | null;
  price?: number | null;
  productType: string;
  brandName: string;
  intro_uz?: string | null;
  intro_ru?: string | null;
  features_uz?: string[];
  features_ru?: string[];
  benefits_uz?: string[];
  benefits_ru?: string[];
  tech_uz?: string | null;
  tech_ru?: string | null;
  fittingRange_uz?: string | null;
  fittingRange_ru?: string | null;
  specsText?: string | null;
  galleryUrls?: string[];
  thumbnailUrl?: string;
  audience?: string[];
  formFactors?: string[];
  signalProcessing?: string | null;
  powerLevel?: string | null;
  hearingLossLevels?: string[];
  smartphoneCompatibility?: string[];
  tinnitusSupport?: boolean | null;
  paymentOptions?: string[];
  availabilityStatus?: string | null;
  status?: 'published' | 'draft' | 'archived';
}

// Rasmlarni yuklab olish funksiyasi
async function downloadImage(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const file = fs.createWriteStream(destPath);
    
    client.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Redirect ni boshqarish
        if (response.headers.location) {
          return downloadImage(response.headers.location, destPath)
            .then(resolve)
            .catch(reject);
        }
      }
      
      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(destPath)) {
          fs.unlinkSync(destPath);
        }
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        if (fs.existsSync(destPath)) {
          fs.unlinkSync(destPath);
        }
        reject(err);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
      }
      reject(err);
    });
  });
}

// Rasm URL'idan fayl nomini olish
function getFilenameFromUrl(url: string, slug: string, index: number): string {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const ext = path.extname(pathname) || '.jpg';
    const baseName = path.basename(pathname, ext);
    
    // Agar fayl nomi mavjud bo'lsa va ma'noli bo'lsa, ishlatish
    if (baseName && baseName.length > 3) {
      return `${slug}-${baseName}${ext}`;
    }
    
    // Aks holda, slug va index ishlatish
    return `${slug}-${index}${ext}`;
  } catch {
    // URL noto'g'ri bo'lsa, slug va index ishlatish
    return `${slug}-${index}.jpg`;
  }
}

// Media yaratish yoki topish
async function getOrCreateMedia(
  url: string,
  localPath: string | null,
  alt_uz: string,
  alt_ru: string
): Promise<string> {
  // Agar lokal yo'l bo'lsa, uni URL sifatida ishlatish
  const finalUrl = localPath ? `/uploads/products/${path.basename(localPath)}` : url;
  
  // Avval finalUrl bo'yicha qidirish
  let media = await prisma.media.findFirst({
    where: { url: finalUrl },
  });

  if (media) {
    return media.id;
  }

  // Agar tashqi URL bo'lsa, uni ham qidirish
  if (url.startsWith('http://') || url.startsWith('https://')) {
    media = await prisma.media.findFirst({
      where: { url: url },
    });
    
    if (media) {
      // Agar Media topilsa, lekin URL mos kelmasa, URL ni yangilash
      if (media.url !== finalUrl) {
        media = await prisma.media.update({
          where: { id: media.id },
          data: { url: finalUrl },
        });
      }
      return media.id;
    }
  }

  // Media yaratish
  media = await prisma.media.create({
    data: {
      url: finalUrl,
      filename: localPath ? path.basename(localPath) : path.basename(url),
      mimeType: 'image/jpeg', // Default, keyinroq aniqlash mumkin
      size: localPath ? fs.statSync(localPath).size : 0,
      alt_uz,
      alt_ru,
    },
  });

  return media.id;
}

async function importProductsWithImages(jsonFilePath: string) {
  try {
    console.log('=== Mahsulotlarni rasmlar bilan import qilish ===\n');

    // 1. JSON faylni o'qish
    console.log(`1. JSON faylni o'qish: ${jsonFilePath}...`);
    if (!fs.existsSync(jsonFilePath)) {
      throw new Error(`Fayl topilmadi: ${jsonFilePath}`);
    }

    const productsData = JSON.parse(
      fs.readFileSync(jsonFilePath, 'utf-8')
    ) as ProductImport[];

    console.log(`   ✅ ${productsData.length} ta mahsulot topildi\n`);

    // 2. Uploads papkasini yaratish
    // Script root papkadan ishga tushiriladi, lekin backend papkasidan ham ishlatilishi mumkin
    const rootDir = process.cwd().endsWith('apps/backend') 
      ? path.join(process.cwd(), '..', '..')
      : process.cwd();
    const uploadsDir = path.join(rootDir, 'uploads', 'products');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`   ✅ Uploads papkasi yaratildi: ${uploadsDir}\n`);
    }

    // 3. Brand larni yaratish/yangilash
    console.log('2. Brand larni tayyorlash...');
    const brands = new Set<string>();
    productsData.forEach((product) => {
      if (product.brandName && product.brandName.trim()) {
        brands.add(product.brandName.trim());
      }
    });

    const brandMap = new Map<string, string>();
    for (const brandName of brands) {
      const brandSlug = brandName.toLowerCase().replace(/\s+/g, '-');
      const brand = await prisma.brand.upsert({
        where: { name: brandName },
        update: {},
        create: {
          name: brandName,
          slug: brandSlug,
        },
      });
      brandMap.set(brandName, brand.id);
      console.log(`   ✅ Brand: ${brandName}`);
    }
    console.log('');

    // 4. Mahsulotlarni import qilish
    console.log('3. Mahsulotlarni import qilish...');
    let imported = 0;
    let errors = 0;
    let imagesDownloaded = 0;
    let imagesSkipped = 0;

    for (const productData of productsData) {
      try {
        // Brand ni topish
        let brandName = productData.brandName?.trim() || 'Unknown';
        let brandId = brandMap.get(brandName);
        
        // ProductType ni aniqlash va brand ni to'g'rilash
        let productType = productData.productType || 'hearing-aids';
        
        // Interacoustics mahsulotlarini aniqlash (brand yoki mahsulot nomi bo'yicha)
        const productNameLower = productData.name_ru.toLowerCase();
        const isInteracousticsProduct = 
          brandName.toLowerCase().includes('interacoustics') ||
          productNameLower.includes('visualeyes') ||
          productNameLower.includes('eyeseecam') ||
          productNameLower.includes('titan') ||
          productNameLower.includes('eclipse') ||
          productNameLower.includes('at 235') ||
          productNameLower.includes('affinity') ||
          productNameLower.includes('ad629') ||
          productNameLower.includes('ad226') ||
          productNameLower.includes('ac40') ||
          productNameLower.includes('aa222');
        
        if (isInteracousticsProduct) {
          productType = 'interacoustics';
          // Brand nomini Interacoustics ga o'zgartirish
          brandName = 'Interacoustics';
          brandId = brandMap.get('Interacoustics');
          
          // Agar Interacoustics brand mavjud bo'lmasa, yaratish
          if (!brandId) {
            const interacousticsBrand = await prisma.brand.upsert({
              where: { name: 'Interacoustics' },
              update: {},
              create: {
                name: 'Interacoustics',
                slug: 'interacoustics',
              },
            });
            brandId = interacousticsBrand.id;
            brandMap.set('Interacoustics', brandId);
          }
        }
        
        // Unknown brandini accessories productType ga o'zgartirish
        if (brandName === 'Unknown' || brandName === 'unknown') {
          productType = 'accessories';
          brandName = 'Unknown';
          brandId = brandMap.get('Unknown');
          
          // Agar Unknown brand mavjud bo'lmasa, yaratish
          if (!brandId) {
            const unknownBrand = await prisma.brand.upsert({
              where: { name: 'Unknown' },
              update: {},
              create: {
                name: 'Unknown',
                slug: 'unknown',
              },
            });
            brandId = unknownBrand.id;
            brandMap.set('Unknown', brandId);
          }
        }

        // Rasmlarni yuklab olish va Media yaratish
        const galleryIds: string[] = [];
        let thumbnailId: string | undefined = undefined;

        // Gallery rasmlari
        if (productData.galleryUrls && productData.galleryUrls.length > 0) {
          for (let i = 0; i < productData.galleryUrls.length; i++) {
            const imageUrl = productData.galleryUrls[i];
            
            // Faqat tashqi URL'larni yuklab olish (http:// yoki https://)
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
              try {
                const filename = getFilenameFromUrl(imageUrl, productData.slug, i + 1);
                const localPath = path.join(uploadsDir, filename);

                // Rasmni yuklab olish
                console.log(`   📥 Rasm yuklanmoqda: ${imageUrl.substring(0, 50)}...`);
                try {
                  await downloadImage(imageUrl, localPath);
                  // Fayl yuklangandan keyin tekshirish
                  if (fs.existsSync(localPath)) {
                    imagesDownloaded++;
                    console.log(`   ✅ Rasm yuklandi: ${path.basename(localPath)}`);
                  } else {
                    throw new Error('Fayl yuklanmadi');
                  }
                } catch (error: any) {
                  console.log(`   ⚠️  Rasm yuklanmadi (${imageUrl.substring(0, 50)}...): ${error.message}`);
                  imagesSkipped++;
                  throw error; // Re-throw to handle in outer catch
                }

                // Media yaratish
                const mediaId = await getOrCreateMedia(
                  imageUrl,
                  localPath,
                  productData.name_uz,
                  productData.name_ru
                );
                galleryIds.push(mediaId);

                // Birinchi rasm thumbnail bo'lishi
                if (!thumbnailId) {
                  thumbnailId = mediaId;
                }
              } catch (error: any) {
                console.log(`   ⚠️  Rasm yuklanmadi (${imageUrl.substring(0, 50)}...): ${error.message}`);
                imagesSkipped++;
                
                // Xatolik bo'lsa ham, URL ni Media sifatida saqlash
                const mediaId = await getOrCreateMedia(
                  imageUrl,
                  null,
                  productData.name_uz,
                  productData.name_ru
                );
                galleryIds.push(mediaId);
                if (!thumbnailId) {
                  thumbnailId = mediaId;
                }
              }
            } else {
              // Lokal yo'l yoki nisbiy yo'l
              const mediaId = await getOrCreateMedia(
                imageUrl,
                null,
                productData.name_uz,
                productData.name_ru
              );
              galleryIds.push(mediaId);
              if (!thumbnailId) {
                thumbnailId = mediaId;
              }
            }
          }
        }

        // Thumbnail URL
        if (productData.thumbnailUrl) {
          const thumbnailUrl = productData.thumbnailUrl;
          
          if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) {
            try {
              const filename = getFilenameFromUrl(thumbnailUrl, productData.slug, 0);
              const localPath = path.join(uploadsDir, filename);

              console.log(`   📥 Thumbnail yuklanmoqda: ${thumbnailUrl.substring(0, 50)}...`);
              await downloadImage(thumbnailUrl, localPath);
              imagesDownloaded++;

              const mediaId = await getOrCreateMedia(
                thumbnailUrl,
                localPath,
                productData.name_uz,
                productData.name_ru
              );
              thumbnailId = mediaId;
            } catch (error: any) {
              console.log(`   ⚠️  Thumbnail yuklanmadi: ${error.message}`);
              imagesSkipped++;
            }
          }
        }

        // Mahsulotni yaratish yoki yangilash
        const productDataToCreate: any = {
          name_uz: productData.name_uz.trim(),
          name_ru: productData.name_ru.trim(),
          slug: productData.slug.trim(),
          description_uz: productData.description_uz?.trim() || null,
          description_ru: productData.description_ru?.trim() || null,
          price: productData.price !== null && productData.price !== undefined 
            ? parseFloat(productData.price.toString()) 
            : null,
          productType: productType,
          intro_uz: productData.intro_uz?.trim() || null,
          intro_ru: productData.intro_ru?.trim() || null,
          features_uz: productData.features_uz || [],
          features_ru: productData.features_ru || [],
          benefits_uz: productData.benefits_uz || [],
          benefits_ru: productData.benefits_ru || [],
          tech_uz: productData.tech_uz?.trim() || null,
          tech_ru: productData.tech_ru?.trim() || null,
          fittingRange_uz: productData.fittingRange_uz?.trim() || null,
          fittingRange_ru: productData.fittingRange_ru?.trim() || null,
          specsText: productData.specsText?.trim() || null,
          galleryIds: galleryIds,
          thumbnailId: thumbnailId || null,
          audience: productData.audience || [],
          formFactors: productData.formFactors || [],
          signalProcessing: productData.signalProcessing || null,
          powerLevel: productData.powerLevel || null,
          hearingLossLevels: productData.hearingLossLevels || [],
          smartphoneCompatibility: productData.smartphoneCompatibility || [],
          tinnitusSupport: productData.tinnitusSupport || false,
          paymentOptions: productData.paymentOptions || [],
          availabilityStatus: productData.availabilityStatus || null,
          status: productData.status || 'published',
        };

        // Brand ni qo'shish
        if (brandId) {
          productDataToCreate.brand = { connect: { id: brandId } };
        } else {
          productDataToCreate.brand = { disconnect: true };
        }

        // Update uchun alohida object yaratish
        const updateData: any = { ...productDataToCreate };
        if (brandId) {
          updateData.brand = { connect: { id: brandId } };
        } else {
          updateData.brand = { disconnect: true };
        }

        await prisma.product.upsert({
          where: { slug: productData.slug },
          update: updateData,
          create: productDataToCreate,
        });

        console.log(
          `   ✅ ${productData.name_ru} (${galleryIds.length} rasm, ${productType}, brand: ${brandName})`
        );
        imported++;
      } catch (error: any) {
        console.error(`   ❌ Xatolik (${productData.name_ru}):`, error.message);
        errors++;
      }
    }

    console.log('\n=== Natijalar ===');
    console.log(`Import qilingan: ${imported} ta`);
    console.log(`Xatolar: ${errors} ta`);
    console.log(`Rasmlar yuklandi: ${imagesDownloaded} ta`);
    console.log(`Rasmlar o'tkazib yuborildi: ${imagesSkipped} ta`);
  } catch (error) {
    console.error('Xatolik:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Scriptni ishga tushirish
const jsonFilePath = process.argv[2];

if (!jsonFilePath) {
  console.error('❌ JSON fayl yo\'li ko\'rsatilmagan!');
  console.log('\nQanday ishlatish:');
  console.log('  npm run import:products:with-images <json-file-path>');
  console.log('\nMisol:');
  console.log('  npm run import:products:with-images products_update.json');
  process.exit(1);
}

importProductsWithImages(jsonFilePath)
  .then(() => {
    console.log('\n✅ Import yakunlandi');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  });

