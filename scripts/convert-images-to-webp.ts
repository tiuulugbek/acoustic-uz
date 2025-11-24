/**
 * Script to convert existing images to WebP format
 * This script processes all images in the Media table and converts them to WebP
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

const prisma = new PrismaClient();

interface MediaItem {
  id: string;
  url: string;
  filename: string | null;
  mimeType: string | null;
}

async function convertImageToWebP(filePath: string): Promise<{ buffer: Buffer; size: number }> {
  const buffer = await sharp(filePath)
    .webp({ quality: 85, effort: 4 })
    .toBuffer();
  
  return {
    buffer,
    size: buffer.length,
  };
}

async function processMediaItem(media: MediaItem, uploadsDir: string): Promise<void> {
  try {
    // Extract file path from URL
    let relativePath = '';
    
    // Handle URLs like /uploads/filename.jpg or /uploads/products/filename.jpg
    if (media.url.startsWith('/uploads/')) {
      relativePath = media.url.replace('/uploads/', '').split('?')[0];
    } else if (media.url.includes('/uploads/')) {
      relativePath = media.url.split('/uploads/')[1].split('?')[0];
    } else if (media.url.startsWith('http://') || media.url.startsWith('https://')) {
      // Handle absolute URLs
      if (media.url.includes('acoustic.uz') || media.url.includes('localhost')) {
        // Extract path after /uploads/
        const uploadsIndex = media.url.indexOf('/uploads/');
        if (uploadsIndex !== -1) {
          relativePath = media.url.substring(uploadsIndex + '/uploads/'.length).split('?')[0];
        } else {
          // Fallback: use filename from URL
          relativePath = path.basename(media.url).split('?')[0];
        }
      } else {
        console.log(`⊘ External URL (skipped): ${media.url} (ID: ${media.id})`);
        return;
      }
    } else {
      // Fallback: use filename field or basename
      relativePath = media.filename || path.basename(media.url).split('?')[0];
    }
    
    let filePath = path.join(uploadsDir, relativePath);
    const originalRelativePath = relativePath; // Store original for debugging
    
    // Step 1: Check if WebP file exists in filesystem
    // If database says WebP, check if file actually exists
    let needsConversion = false;
    let foundOriginalFile = false;
    
    if (media.mimeType === 'image/webp' || relativePath.toLowerCase().endsWith('.webp')) {
      // Check if WebP file actually exists using fs.access (throws if doesn't exist)
      try {
        await fs.access(filePath);
        // File exists, verify it's actually a file
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          // WebP file actually exists, skip it
          console.log(`✓ Already WebP: ${relativePath} (ID: ${media.id})`);
          return;
        }
      } catch (err: any) {
        // WebP file doesn't exist (ENOENT error) - look for original file
        if (err.code === 'ENOENT') {
          needsConversion = true;
        } else {
          // Other error, log it
          console.log(`⚠️  Error checking WebP file: ${relativePath} (ID: ${media.id}), error: ${err.code}`);
          return;
        }
      }
      
      if (needsConversion) {
        // Try to find original file (JPG/PNG) to recreate WebP
        const possibleExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        
        for (const ext of possibleExtensions) {
          const originalPath = originalRelativePath.replace(/\.webp$/i, ext);
          const originalFilePath = path.join(uploadsDir, originalPath);
          try {
            await fs.access(originalFilePath);
            const originalStats = await fs.stat(originalFilePath);
            if (originalStats.isFile()) {
              // Found original file, use it for conversion
              relativePath = originalPath;
              filePath = originalFilePath;
              foundOriginalFile = true;
              console.log(`⚠️  WebP missing (DB: ${originalRelativePath}), found original: ${originalPath} (ID: ${media.id})`);
              break;
            }
          } catch {
            // Continue searching
          }
        }
        
        if (!foundOriginalFile) {
          console.log(`⚠️  WebP and original file not found: ${originalRelativePath} (ID: ${media.id})`);
          return;
        }
      }
    } else {
      // Not a WebP in database, check if file exists
      try {
        await fs.access(filePath);
        const stats = await fs.stat(filePath);
        if (!stats.isFile()) {
          console.log(`⚠️  File not found: ${relativePath} (ID: ${media.id}, URL: ${media.url})`);
          return;
        }
      } catch {
        console.log(`⚠️  File not found: ${relativePath} (ID: ${media.id}, URL: ${media.url})`);
        return;
      }
    }

    // Step 4: Check if it's an image that can be converted
    const fileExtension = path.extname(relativePath).toLowerCase();
    const isImageFile = ['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension);
    
    if (!isImageFile) {
      console.log(`⊘ Not an image file: ${relativePath} (ID: ${media.id})`);
      return;
    }

    // Step 5: Get file stats and convert
    const stats = await fs.stat(filePath);
    const originalSize = stats.size;

    console.log(`🔄 Converting: ${relativePath} (${(originalSize / 1024).toFixed(2)} KB)...`);
    const { buffer, size: newSize } = await convertImageToWebP(filePath);

    // Calculate savings
    const savings = ((originalSize - newSize) / originalSize) * 100;
    const savingsKB = (originalSize - newSize) / 1024;

    // Generate new filename
    const filenameOnly = path.basename(relativePath);
    const nameWithoutExt = path.parse(filenameOnly).name;
    const date = filenameOnly.match(/^\d{4}-\d{2}-\d{2}-/)?.[0] || '';
    const newFilename = date ? `${date}${nameWithoutExt.replace(date, '')}.webp` : `${nameWithoutExt}.webp`;
    
    // Preserve directory structure
    const relativeDir = path.dirname(relativePath);
    const newRelativePath = relativeDir !== '.' 
      ? path.join(relativeDir, newFilename).replace(/\\/g, '/')
      : newFilename;
    const newFilePath = path.join(uploadsDir, newRelativePath);
    
    // Ensure directory exists
    if (relativeDir !== '.') {
      const dirPath = path.join(uploadsDir, relativeDir);
      await fs.mkdir(dirPath, { recursive: true });
    }

    // Save WebP file
    await fs.writeFile(newFilePath, buffer);

    // Delete original file
    await fs.unlink(filePath);

    // Update database
    await prisma.media.update({
      where: { id: media.id },
      data: {
        url: `/uploads/${newRelativePath}`,
        filename: newFilename,
        mimeType: 'image/webp',
        size: newSize,
      },
    });

    console.log(`✅ Converted: ${relativePath} → ${newRelativePath} (${(newSize / 1024).toFixed(2)} KB, saved ${savings.toFixed(1)}% / ${savingsKB.toFixed(2)} KB)`);
  } catch (error) {
    console.error(`❌ Error processing ${media.filename || media.url} (ID: ${media.id}):`, error);
  }
}

async function main() {
  console.log('🚀 Starting image conversion to WebP...\n');

  // Get project root (go up from scripts/ directory)
  const projectRoot = path.resolve(__dirname, '..');
  const uploadsDir = path.join(projectRoot, 'uploads');

  // Check if uploads directory exists
  try {
    await fs.access(uploadsDir);
  } catch {
    console.error(`❌ Uploads directory not found: ${uploadsDir}`);
    process.exit(1);
  }

  // Get all media items
  const allMedia = await prisma.media.findMany({
    select: {
      id: true,
      url: true,
      filename: true,
      mimeType: true,
    },
  });

  console.log(`📊 Found ${allMedia.length} media items\n`);

  // Process each media item
  let converted = 0;
  let skipped = 0;
  let errors = 0;

  for (const media of allMedia) {
    const beforeMimeType = media.mimeType;
    const beforeUrl = media.url;
    
    await processMediaItem(media, uploadsDir);
    
    // Check if conversion happened by checking if URL changed
    const afterMedia = await prisma.media.findUnique({
      where: { id: media.id },
      select: { mimeType: true, url: true },
    });

    if (afterMedia?.mimeType === 'image/webp' && beforeMimeType !== 'image/webp') {
      converted++;
    } else if (beforeMimeType === 'image/webp' && beforeUrl === afterMedia?.url) {
      skipped++;
    } else if (beforeMimeType === 'image/webp' && beforeUrl !== afterMedia?.url) {
      // WebP was recreated from original
      converted++;
    } else {
      errors++;
    }
  }

  console.log(`\n📈 Summary:`);
  console.log(`   ✅ Converted: ${converted}`);
  console.log(`   ⊘ Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`\n✨ Done!`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
