/**
 * Script to fix image URLs in the database
 * Fixes URLs from old domains/localhost to api.acoustic.uz
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
  console.error('❌ DATABASE_URL not found in .env files');
  console.error('   Please make sure .env file exists in project root with DATABASE_URL');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

/**
 * Normalize URL - same logic as frontend normalizeImageUrl
 */
function normalizeUrl(url: string): string {
  if (!url) return url;

  // If already absolute URL, ensure pathname is properly encoded and fix domain
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url);

      // Fix empty or incorrect hostname
      if (!urlObj.hostname || urlObj.hostname === '' || urlObj.hostname.startsWith('.')) {
        urlObj.hostname = 'a.acoustic.uz';
        urlObj.protocol = 'https:';
      }

      // Fix incorrect domain: acoustic.uz -> a.acoustic.uz
      if (urlObj.hostname === 'acoustic.uz' || urlObj.hostname === 'www.acoustic.uz') {
        urlObj.hostname = 'a.acoustic.uz';
      }

      // Fix incorrect domain: localhost:3001 -> a.acoustic.uz (in production)
      if (urlObj.hostname === 'localhost' && urlObj.port === '3001') {
        urlObj.hostname = 'a.acoustic.uz';
        urlObj.port = '';
        urlObj.protocol = 'https:';
      }

      // Fix old domains
      if (urlObj.hostname === 'news.acoustic.uz' || urlObj.hostname === 'api.news.acoustic.uz') {
        urlObj.hostname = 'a.acoustic.uz';
        urlObj.protocol = 'https:';
      }

      // Fix api.acoustic.uz -> a.acoustic.uz (old API domain)
      if (urlObj.hostname === 'api.acoustic.uz') {
        urlObj.hostname = 'a.acoustic.uz';
        urlObj.protocol = 'https:';
      }

      // Fix old.acoustic.uz domain
      if (urlObj.hostname === 'old.acoustic.uz' || urlObj.hostname === 'www.old.acoustic.uz') {
        urlObj.hostname = 'a.acoustic.uz';
        urlObj.protocol = 'https:';
      }

      // Fix wp-content/uploads/ -> uploads/ (WordPress to new structure)
      if (urlObj.pathname.includes('/wp-content/uploads/')) {
        urlObj.pathname = urlObj.pathname.replace('/wp-content/uploads/', '/uploads/');
      }

      // Remove /api from pathname if present (uploads should be directly under domain)
      if (urlObj.pathname.startsWith('/api/uploads/')) {
        urlObj.pathname = urlObj.pathname.replace('/api/uploads/', '/uploads/');
      } else if (urlObj.pathname.startsWith('/api/') && urlObj.pathname.includes('/uploads/')) {
        urlObj.pathname = urlObj.pathname.replace(/\/api\//, '/');
      }

      // Only encode the filename part, not the entire path
      const pathParts = urlObj.pathname.split('/');
      const filename = pathParts.pop();
      if (filename) {
        // Encode only the filename to handle spaces
        const encodedFilename = encodeURIComponent(filename);
        urlObj.pathname = [...pathParts, encodedFilename].join('/');
      }
      return urlObj.toString();
    } catch {
      // If URL parsing fails, try simple string replacement as fallback
      let fixedUrl = url;

      // Fix empty hostname (.acoustic.uz -> a.acoustic.uz)
      fixedUrl = fixedUrl.replace(/https?:\/\/\.acoustic\.uz\//g, 'https://a.acoustic.uz/');

      // Fix acoustic.uz/api/uploads/ -> a.acoustic.uz/uploads/
      fixedUrl = fixedUrl.replace(/https?:\/\/acoustic\.uz\/api\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      fixedUrl = fixedUrl.replace(/https?:\/\/www\.acoustic\.uz\/api\/uploads\//g, 'https://a.acoustic.uz/uploads/');

      // Fix localhost:3001 -> a.acoustic.uz
      fixedUrl = fixedUrl.replace(/http:\/\/localhost:3001\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      fixedUrl = fixedUrl.replace(/http:\/\/localhost:3001\/api\/uploads\//g, 'https://a.acoustic.uz/uploads/');

      // Fix old domains
      fixedUrl = fixedUrl.replace(/https?:\/\/news\.acoustic\.uz\//g, 'https://a.acoustic.uz/');
      fixedUrl = fixedUrl.replace(/https?:\/\/api\.news\.acoustic\.uz\//g, 'https://a.acoustic.uz/');
      
      // Fix api.acoustic.uz -> a.acoustic.uz (old API domain)
      fixedUrl = fixedUrl.replace(/https?:\/\/api\.acoustic\.uz\//g, 'https://a.acoustic.uz/');
      
      // Fix old.acoustic.uz domain
      fixedUrl = fixedUrl.replace(/https?:\/\/old\.acoustic\.uz\//g, 'https://a.acoustic.uz/');
      fixedUrl = fixedUrl.replace(/https?:\/\/www\.old\.acoustic\.uz\//g, 'https://a.acoustic.uz/');
      
      // Fix wp-content/uploads/ -> uploads/
      fixedUrl = fixedUrl.replace(/\/wp-content\/uploads\//g, '/uploads/');

      return fixedUrl;
    }
  }

  // If relative URL starting with /uploads/, make it absolute
  if (url.startsWith('/uploads/')) {
    const baseUrl = 'https://a.acoustic.uz';

    // Encode only the filename part
    const pathParts = url.split('/');
    const filename = pathParts.pop();
    if (filename) {
      const encodedFilename = encodeURIComponent(filename);
      return `${baseUrl}${pathParts.join('/')}/${encodedFilename}`;
    }
    return `${baseUrl}${url}`;
  }

  return url;
}

/**
 * Fix URLs in rich text content (HTML)
 */
function fixUrlsInContent(content: string | null | undefined): string | null {
  if (!content) return content;

  // Fix URLs in img src attributes
  let fixed = content.replace(
    /<img([^>]*)\ssrc=["']([^"']+)["']([^>]*)>/gi,
    (match, before, src, after) => {
      const fixedSrc = normalizeUrl(src);
      return `<img${before} src="${fixedSrc}"${after}>`;
    }
  );

  // Fix URLs in a href attributes (for links to images)
  fixed = fixed.replace(
    /<a([^>]*)\shref=["']([^"']+)["']([^>]*)>/gi,
    (match, before, href, after) => {
      if (href.includes('/uploads/') || href.includes('acoustic.uz') || href.includes('localhost')) {
        const fixedHref = normalizeUrl(href);
        return `<a${before} href="${fixedHref}"${after}>`;
      }
      return match;
    }
  );

  return fixed;
}

async function main() {
  console.log('🔧 Starting URL fix process...\n');

  let totalFixed = 0;

  // 1. Fix Media URLs
  console.log('📸 Fixing Media URLs...');
  const mediaRecords = await prisma.media.findMany({
    where: {
      OR: [
        { url: { contains: 'localhost' } },
        { url: { contains: '.acoustic.uz' } },
        { url: { contains: 'news.acoustic.uz' } },
        { url: { contains: 'old.acoustic.uz' } },
        { url: { startsWith: 'http://' } },
      ],
    },
  });

  console.log(`   Found ${mediaRecords.length} media records to check`);

  for (const media of mediaRecords) {
    const fixedUrl = normalizeUrl(media.url);
    if (fixedUrl !== media.url) {
      await prisma.media.update({
        where: { id: media.id },
        data: { url: fixedUrl },
      });
      console.log(`   ✅ Fixed: ${media.id.substring(0, 8)}... ${media.url.substring(0, 50)}... -> ${fixedUrl.substring(0, 50)}...`);
      totalFixed++;
    }
  }

  // 2. Fix Product galleryUrls
  console.log('\n🖼️  Fixing Product galleryUrls...');
  // Get all products with galleryUrls, then filter in memory to find ones with bad URLs
  const allProducts = await prisma.product.findMany({
    where: {
      galleryUrls: {
        isEmpty: false,
      },
    },
  });
  
  // Filter products that have bad URLs
  const products = allProducts.filter(product => 
    product.galleryUrls.some(url => 
      url.includes('localhost') ||
      url.includes('.acoustic.uz') ||
      url.includes('news.acoustic.uz') ||
      url.includes('old.acoustic.uz') ||
      url.startsWith('http://')
    )
  );

  console.log(`   Found ${products.length} products to check`);

  for (const product of products) {
    const fixedUrls = product.galleryUrls.map((url) => normalizeUrl(url));
    const hasChanges = fixedUrls.some((url, index) => url !== product.galleryUrls[index]);

    if (hasChanges) {
      await prisma.product.update({
        where: { id: product.id },
        data: { galleryUrls: fixedUrls },
      });
      console.log(`   ✅ Fixed: ${product.slug} (${fixedUrls.length} URLs)`);
      totalFixed++;
    }
  }

  // 3. Fix rich text content in Services
  console.log('\n📝 Fixing Service content URLs...');
  const services = await prisma.service.findMany({
    where: {
      OR: [
        { body_uz: { contains: 'localhost' } },
        { body_uz: { contains: 'acoustic.uz' } },
        { body_uz: { contains: 'old.acoustic.uz' } },
        { body_ru: { contains: 'localhost' } },
        { body_ru: { contains: 'acoustic.uz' } },
        { body_ru: { contains: 'old.acoustic.uz' } },
      ],
    },
  });

  console.log(`   Found ${services.length} services to check`);

  for (const service of services) {
    const fixedBodyUz = fixUrlsInContent(service.body_uz);
    const fixedBodyRu = fixUrlsInContent(service.body_ru);
    const hasChanges = fixedBodyUz !== service.body_uz || fixedBodyRu !== service.body_ru;

    if (hasChanges) {
      await prisma.service.update({
        where: { id: service.id },
        data: {
          body_uz: fixedBodyUz,
          body_ru: fixedBodyRu,
        },
      });
      console.log(`   ✅ Fixed: ${service.slug}`);
      totalFixed++;
    }
  }

  // 4. Fix rich text content in Products
  console.log('\n📦 Fixing Product content URLs...');
  const productsWithContent = await prisma.product.findMany({
    where: {
      OR: [
        { description_uz: { contains: 'localhost' } },
        { description_uz: { contains: 'acoustic.uz' } },
        { description_uz: { contains: 'old.acoustic.uz' } },
        { description_ru: { contains: 'localhost' } },
        { description_ru: { contains: 'acoustic.uz' } },
        { description_ru: { contains: 'old.acoustic.uz' } },
        { tech_uz: { contains: 'localhost' } },
        { tech_uz: { contains: 'acoustic.uz' } },
        { tech_uz: { contains: 'old.acoustic.uz' } },
        { tech_ru: { contains: 'localhost' } },
        { tech_ru: { contains: 'acoustic.uz' } },
        { tech_ru: { contains: 'old.acoustic.uz' } },
        { fittingRange_uz: { contains: 'localhost' } },
        { fittingRange_uz: { contains: 'acoustic.uz' } },
        { fittingRange_uz: { contains: 'old.acoustic.uz' } },
        { fittingRange_ru: { contains: 'localhost' } },
        { fittingRange_ru: { contains: 'acoustic.uz' } },
        { fittingRange_ru: { contains: 'old.acoustic.uz' } },
      ],
    },
  });

  console.log(`   Found ${productsWithContent.length} products to check`);

  for (const product of productsWithContent) {
    const fixedDescriptionUz = fixUrlsInContent(product.description_uz);
    const fixedDescriptionRu = fixUrlsInContent(product.description_ru);
    const fixedTechUz = fixUrlsInContent(product.tech_uz);
    const fixedTechRu = fixUrlsInContent(product.tech_ru);
    const fixedFittingRangeUz = fixUrlsInContent(product.fittingRange_uz);
    const fixedFittingRangeRu = fixUrlsInContent(product.fittingRange_ru);

    const hasChanges =
      fixedDescriptionUz !== product.description_uz ||
      fixedDescriptionRu !== product.description_ru ||
      fixedTechUz !== product.tech_uz ||
      fixedTechRu !== product.tech_ru ||
      fixedFittingRangeUz !== product.fittingRange_uz ||
      fixedFittingRangeRu !== product.fittingRange_ru;

    if (hasChanges) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          description_uz: fixedDescriptionUz,
          description_ru: fixedDescriptionRu,
          tech_uz: fixedTechUz,
          tech_ru: fixedTechRu,
          fittingRange_uz: fixedFittingRangeUz,
          fittingRange_ru: fixedFittingRangeRu,
        },
      });
      console.log(`   ✅ Fixed: ${product.slug}`);
      totalFixed++;
    }
  }

  // 5. Fix rich text content in Posts
  console.log('\n📰 Fixing Post content URLs...');
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { body_uz: { contains: 'localhost' } },
        { body_uz: { contains: 'acoustic.uz' } },
        { body_uz: { contains: 'old.acoustic.uz' } },
        { body_ru: { contains: 'localhost' } },
        { body_ru: { contains: 'acoustic.uz' } },
        { body_ru: { contains: 'old.acoustic.uz' } },
      ],
    },
  });

  console.log(`   Found ${posts.length} posts to check`);

  for (const post of posts) {
    const fixedBodyUz = fixUrlsInContent(post.body_uz);
    const fixedBodyRu = fixUrlsInContent(post.body_ru);
    const hasChanges = fixedBodyUz !== post.body_uz || fixedBodyRu !== post.body_ru;

    if (hasChanges) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          body_uz: fixedBodyUz,
          body_ru: fixedBodyRu,
        },
      });
      console.log(`   ✅ Fixed: ${post.slug}`);
      totalFixed++;
    }
  }

  // 6. Fix rich text content in Pages
  console.log('\n📄 Fixing Page content URLs...');
  const pages = await prisma.page.findMany({
    where: {
      OR: [
        { body_uz: { contains: 'localhost' } },
        { body_uz: { contains: 'acoustic.uz' } },
        { body_uz: { contains: 'old.acoustic.uz' } },
        { body_ru: { contains: 'localhost' } },
        { body_ru: { contains: 'acoustic.uz' } },
        { body_ru: { contains: 'old.acoustic.uz' } },
      ],
    },
  });

  console.log(`   Found ${pages.length} pages to check`);

  for (const page of pages) {
    const fixedBodyUz = fixUrlsInContent(page.body_uz);
    const fixedBodyRu = fixUrlsInContent(page.body_ru);
    const hasChanges = fixedBodyUz !== page.body_uz || fixedBodyRu !== page.body_ru;

    if (hasChanges) {
      await prisma.page.update({
        where: { id: page.id },
        data: {
          body_uz: fixedBodyUz,
          body_ru: fixedBodyRu,
        },
      });
      console.log(`   ✅ Fixed: ${page.slug}`);
      totalFixed++;
    }
  }

  console.log(`\n✅ URL fix complete! Fixed ${totalFixed} records.`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

