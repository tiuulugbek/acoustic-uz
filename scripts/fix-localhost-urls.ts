/**
 * Script to fix localhost:3001 URLs in database
 * Replaces http://localhost:3001 with https://api.acoustic.uz
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env file from project root or apps/backend
const envPaths = [
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '..', 'apps', 'backend', '.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`✅ Loaded .env from: ${envPath}`);
    break;
  }
}

// Also try to load from process.env directly (if already set)
if (!process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL not found in .env files');
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function fixLocalhostUrls() {
  console.log('🔍 Searching for localhost:3001 URLs in database...');

  const productionUrl = 'https://api.acoustic.uz';
  const localhostUrl = 'http://localhost:3001';

  let updatedCount = 0;

  // Fix Media URLs
  console.log('\n📸 Fixing Media URLs...');
  const mediaItems = await prisma.media.findMany({
    where: {
      url: {
        contains: localhostUrl,
      },
    },
  });

  for (const media of mediaItems) {
    const newUrl = media.url.replace(localhostUrl, productionUrl);
    await prisma.media.update({
      where: { id: media.id },
      data: { url: newUrl },
    });
    console.log(`  ✅ Updated media ${media.id}: ${media.url} -> ${newUrl}`);
    updatedCount++;
  }

  // Fix Product galleryUrls
  console.log('\n📦 Fixing Product galleryUrls...');
  const allProducts = await prisma.product.findMany({
    where: {
      galleryUrls: {
        not: null,
      },
    },
  });
  
  const products = allProducts.filter((product) => {
    if (!product.galleryUrls || !Array.isArray(product.galleryUrls)) return false;
    return product.galleryUrls.some((url: string) => 
      typeof url === 'string' && url.includes(localhostUrl)
    );
  });

  for (const product of products) {
    if (product.galleryUrls && Array.isArray(product.galleryUrls)) {
      const updatedUrls = product.galleryUrls.map((url: string) =>
        typeof url === 'string' ? url.replace(localhostUrl, productionUrl) : url
      );
      
      await prisma.product.update({
        where: { id: product.id },
        data: { galleryUrls: updatedUrls },
      });
      console.log(`  ✅ Updated product ${product.slug}: ${product.galleryUrls.length} URLs`);
      updatedCount++;
    }
  }

  // Fix Branch tour3d_config panorama URLs
  console.log('\n🏢 Fixing Branch tour3d_config panorama URLs...');
  const branches = await prisma.branch.findMany({
    where: {
      tour3d_config: {
        not: null,
      },
    },
  });

  for (const branch of branches) {
    if (branch.tour3d_config && typeof branch.tour3d_config === 'object') {
      const config = branch.tour3d_config as any;
      let updated = false;

      if (config.scenes && typeof config.scenes === 'object') {
        for (const sceneId in config.scenes) {
          const scene = config.scenes[sceneId];
          if (scene.panorama && typeof scene.panorama === 'string') {
            if (scene.panorama.includes(localhostUrl)) {
              scene.panorama = scene.panorama.replace(localhostUrl, productionUrl);
              updated = true;
            }
          }
        }
      }

      if (updated) {
        await prisma.branch.update({
          where: { id: branch.id },
          data: { tour3d_config: config },
        });
        console.log(`  ✅ Updated branch ${branch.slug}: tour3d_config`);
        updatedCount++;
      }
    }
  }

  // Fix Settings logo URLs
  console.log('\n⚙️ Fixing Settings logo URLs...');
  const settings = await prisma.settings.findMany({
    where: {
      OR: [
        { logo_uz: { contains: localhostUrl } },
        { logo_ru: { contains: localhostUrl } },
      ],
    },
  });

  for (const setting of settings) {
    const updates: any = {};
    if (setting.logo_uz && setting.logo_uz.includes(localhostUrl)) {
      updates.logo_uz = setting.logo_uz.replace(localhostUrl, productionUrl);
    }
    if (setting.logo_ru && setting.logo_ru.includes(localhostUrl)) {
      updates.logo_ru = setting.logo_ru.replace(localhostUrl, productionUrl);
    }

    if (Object.keys(updates).length > 0) {
      await prisma.settings.update({
        where: { id: setting.id },
        data: updates,
      });
      console.log(`  ✅ Updated settings ${setting.id}`);
      updatedCount++;
    }
  }

  // Fix Banner image URLs
  console.log('\n🎨 Fixing Banner image URLs...');
  const banners = await prisma.banner.findMany({
    where: {
      imageUrl: {
        contains: localhostUrl,
      },
    },
  });

  for (const banner of banners) {
    const newUrl = banner.imageUrl.replace(localhostUrl, productionUrl);
    await prisma.banner.update({
      where: { id: banner.id },
      data: { imageUrl: newUrl },
    });
    console.log(`  ✅ Updated banner ${banner.id}: ${banner.imageUrl} -> ${newUrl}`);
    updatedCount++;
  }

  // Fix Post cover URLs
  console.log('\n📝 Fixing Post cover URLs (via Media)...');
  // Posts use Media table, so they're already covered above

  console.log(`\n✅ Total updated: ${updatedCount} records`);
}

fixLocalhostUrls()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

