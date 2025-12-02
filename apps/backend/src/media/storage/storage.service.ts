import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { S3 } from 'aws-sdk';
import sharp from 'sharp';

export interface UploadedFile {
  fieldname?: string;
  originalname: string;
  encoding?: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer: Buffer;
}

export interface UploadResult {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class StorageService {
  private driver: 'local' | 's3';
  private s3Client: S3 | null = null;
  private s3Bucket: string;
  private uploadDir: string;

  constructor(private configService: ConfigService) {
    this.driver = this.configService.get<'local' | 's3'>('STORAGE_DRIVER', 'local');
    
    // Use explicit uploads directory path to avoid symlink issues
    // Try to use backend/uploads if we're in a monorepo structure
    const backendUploads = path.join(process.cwd(), 'apps', 'backend', 'uploads');
    const rootUploads = path.join(process.cwd(), 'uploads');
    
    // Prefer backend/uploads if it exists or if we're in apps/backend directory
    if (process.cwd().includes('apps/backend') || fs.existsSync(path.join(process.cwd(), 'apps', 'backend'))) {
      this.uploadDir = backendUploads;
    } else {
      this.uploadDir = rootUploads;
    }
    
    // Allow override via environment variable
    const envUploadDir = this.configService.get<string>('UPLOADS_DIR');
    if (envUploadDir) {
      this.uploadDir = envUploadDir;
    }

    if (this.driver === 's3') {
      this.s3Bucket = this.configService.get<string>('S3_BUCKET', 'acoustic');
      this.s3Client = new S3({
        endpoint: this.configService.get<string>('S3_ENDPOINT'),
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('S3_SECRET_KEY'),
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
        sslEnabled: this.configService.get<boolean>('S3_USE_SSL', false),
      });
    }

    this.init();
  }

  private async init() {
    if (this.driver === 'local') {
      try {
        await fs.mkdir(this.uploadDir, { recursive: true });
      } catch (error) {
        // Directory already exists
      }
    }
  }

  async upload(file: UploadedFile, skipWebp: boolean = false): Promise<UploadResult> {
    if (this.driver === 's3') {
      return this.uploadToS3(file, skipWebp);
    }
    return this.uploadLocal(file, skipWebp);
  }

  private async uploadLocal(file: UploadedFile, skipWebp: boolean = false): Promise<UploadResult> {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const timestamp = Date.now(); // Unique timestamp to prevent filename collisions
    const randomSuffix = Math.random().toString(36).substring(2, 8); // Random 6-character suffix
    
    // Convert image to WebP if it's an image and skipWebp is false
    let processedBuffer = file.buffer;
    let mimeType = file.mimetype;
    let size = file.size;
    let originalExt = path.extname(file.originalname).toLowerCase();
    let filename = file.originalname;

    // Check if file is an image that can be converted to WebP
    const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const isImage = imageMimeTypes.includes(file.mimetype.toLowerCase());

    if (!skipWebp && isImage && file.mimetype !== 'image/webp') {
      try {
        // Convert to WebP with quality 85 (good balance between quality and size)
        processedBuffer = await sharp(file.buffer)
          .webp({ quality: 85, effort: 4 })
          .toBuffer();
        
        // Update filename extension to .webp
        const nameWithoutExt = path.parse(file.originalname).name;
        // Sanitize filename: remove special characters and spaces
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}.webp`;
        mimeType = 'image/webp';
        size = processedBuffer.length;
      } catch (error) {
        // If conversion fails, use original file
        console.warn('[StorageService] Failed to convert image to WebP, using original:', error);
        const sanitizedName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        const ext = path.extname(file.originalname);
        filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}${ext}`;
      }
    } else if (skipWebp && isImage) {
      // If skipWebp is true, optimize panorama images aggressively
      // Panorama images are typically very large, so we optimize them significantly
      try {
        const image = sharp(file.buffer);
        const metadata = await image.metadata();
        const sanitizedName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        
        // Panorama rasmlar uchun agressiv optimizatsiya
        // Max width: 3072px (panorama uchun yetarli)
        // Quality: 75% (yaxshi balans)
        const maxWidth = 3072;
        const targetQuality = 75;
        
        if (metadata.width && metadata.width > maxWidth) {
          let sharpInstance = image.resize(maxWidth, null, {
            withoutEnlargement: true,
            fit: 'inside',
          });
          
          // Panorama uchun JPEG format yaxshiroq (kichikroq file size)
          processedBuffer = await sharpInstance
            .jpeg({ quality: targetQuality, progressive: true, mozjpeg: true })
            .toBuffer();
          filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}.jpg`;
          mimeType = 'image/jpeg';
          size = processedBuffer.length;
          
          // Agar hali ham juda katta bo'lsa (masalan, 5MB dan katta), yanada kichraytiramiz
          if (size > 5 * 1024 * 1024) {
            console.log(`[StorageService] Image still large (${(size / 1024 / 1024).toFixed(2)}MB), further optimizing...`);
            const smallerWidth = Math.floor(maxWidth * 0.75); // 75% ga kichraytiramiz
            processedBuffer = await image
              .resize(smallerWidth, null, {
                withoutEnlargement: true,
                fit: 'inside',
              })
              .jpeg({ quality: 70, progressive: true, mozjpeg: true })
              .toBuffer();
            filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}.jpg`;
            mimeType = 'image/jpeg';
            size = processedBuffer.length;
          }
        } else {
          // Image is already reasonably sized, optimize quality
          // Panorama uchun JPEG format yaxshiroq
          processedBuffer = await image
            .jpeg({ quality: targetQuality, progressive: true, mozjpeg: true })
            .toBuffer();
          filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}.jpg`;
          mimeType = 'image/jpeg';
          size = processedBuffer.length;
        }
      } catch (error) {
        // If optimization fails, use original file
        console.warn('[StorageService] Failed to optimize panorama image, using original:', error);
        const sanitizedName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        const ext = path.extname(file.originalname);
        filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}${ext}`;
        // Keep original buffer, mimeType, and size
      }
    } else {
      const sanitizedName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const ext = path.extname(file.originalname);
      filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}${ext}`;
    }

    const filepath = path.join(this.uploadDir, filename);
    await fs.writeFile(filepath, processedBuffer);

    // Set file permissions so Nginx (www-data) can read it
    // Try to set ownership to deploy:deploy or www-data:www-data if possible
    try {
      await fs.chmod(filepath, 0o644); // rw-r--r--
      
      // Try to change ownership if running as root
      // This will fail silently if not running as root or if chown is not available
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      // Try deploy:deploy first (common deployment user), fallback to www-data:www-data
      try {
        await execAsync(`chown deploy:deploy "${filepath}"`);
      } catch {
        try {
          await execAsync(`chown www-data:www-data "${filepath}"`);
        } catch {
          // Ignore if chown fails (not running as root or user doesn't exist)
        }
      }
    } catch (error) {
      // Ignore permission errors (file is still created)
      console.warn('[StorageService] Failed to set file permissions:', error);
    }

    return {
      url: `/uploads/${filename}`,
      filename,
      mimeType,
      size,
    };
  }

  private async uploadToS3(file: UploadedFile, skipWebp: boolean = false): Promise<UploadResult> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const timestamp = Date.now(); // Unique timestamp to prevent filename collisions
    const randomSuffix = Math.random().toString(36).substring(2, 8); // Random 6-character suffix
    
    // Convert image to WebP if it's an image and skipWebp is false
    let processedBuffer = file.buffer;
    let mimeType = file.mimetype;
    let size = file.size;
    let originalExt = path.extname(file.originalname).toLowerCase();
    let filename = file.originalname;

    // Check if file is an image that can be converted to WebP
    const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const isImage = imageMimeTypes.includes(file.mimetype.toLowerCase());

    if (!skipWebp && isImage && file.mimetype !== 'image/webp') {
      try {
        // Convert to WebP with quality 85 (good balance between quality and size)
        processedBuffer = await sharp(file.buffer)
          .webp({ quality: 85, effort: 4 })
          .toBuffer();
        
        // Update filename extension to .webp
        const nameWithoutExt = path.parse(file.originalname).name;
        // Sanitize filename: remove special characters and spaces
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}.webp`;
        mimeType = 'image/webp';
        size = processedBuffer.length;
      } catch (error) {
        // If conversion fails, use original file
        console.warn('[StorageService] Failed to convert image to WebP, using original:', error);
        const sanitizedName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        const ext = path.extname(file.originalname);
        filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}${ext}`;
      }
    } else if (skipWebp && isImage) {
      // If skipWebp is true, optimize panorama images aggressively
      // Panorama images are typically very large, so we optimize them significantly
      try {
        const image = sharp(file.buffer);
        const metadata = await image.metadata();
        const sanitizedName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        
        // Panorama rasmlar uchun agressiv optimizatsiya
        // Max width: 3072px (panorama uchun yetarli)
        // Quality: 75% (yaxshi balans)
        const maxWidth = 3072;
        const targetQuality = 75;
        
        if (metadata.width && metadata.width > maxWidth) {
          let sharpInstance = image.resize(maxWidth, null, {
            withoutEnlargement: true,
            fit: 'inside',
          });
          
          // Panorama uchun JPEG format yaxshiroq (kichikroq file size)
          processedBuffer = await sharpInstance
            .jpeg({ quality: targetQuality, progressive: true, mozjpeg: true })
            .toBuffer();
          filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}.jpg`;
          mimeType = 'image/jpeg';
          size = processedBuffer.length;
          
          // Agar hali ham juda katta bo'lsa (masalan, 5MB dan katta), yanada kichraytiramiz
          if (size > 5 * 1024 * 1024) {
            console.log(`[StorageService] Image still large (${(size / 1024 / 1024).toFixed(2)}MB), further optimizing...`);
            const smallerWidth = Math.floor(maxWidth * 0.75); // 75% ga kichraytiramiz
            processedBuffer = await image
              .resize(smallerWidth, null, {
                withoutEnlargement: true,
                fit: 'inside',
              })
              .jpeg({ quality: 70, progressive: true, mozjpeg: true })
              .toBuffer();
            filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}.jpg`;
            mimeType = 'image/jpeg';
            size = processedBuffer.length;
          }
        } else {
          // Image is already reasonably sized, optimize quality
          // Panorama uchun JPEG format yaxshiroq
          processedBuffer = await image
            .jpeg({ quality: targetQuality, progressive: true, mozjpeg: true })
            .toBuffer();
          filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}.jpg`;
          mimeType = 'image/jpeg';
          size = processedBuffer.length;
        }
      } catch (error) {
        // If optimization fails, use original file
        console.warn('[StorageService] Failed to optimize panorama image, using original:', error);
        const sanitizedName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        const ext = path.extname(file.originalname);
        filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}${ext}`;
        // Keep original buffer, mimeType, and size
      }
    } else {
      const sanitizedName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const ext = path.extname(file.originalname);
      filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}${ext}`;
    }

    const result = await this.s3Client
      .upload({
        Bucket: this.s3Bucket,
        Key: filename,
        Body: processedBuffer,
        ContentType: mimeType,
        ACL: 'public-read',
      })
      .promise();

    return {
      url: result.Location,
      filename,
      mimeType,
      size,
    };
  }

  async delete(url: string): Promise<void> {
    if (this.driver === 's3') {
      return this.deleteFromS3(url);
    }
    return this.deleteLocal(url);
  }

  private async deleteLocal(url: string): Promise<void> {
    const filename = path.basename(url);
    const filepath = path.join(this.uploadDir, filename);
    try {
      await fs.unlink(filepath);
    } catch (error) {
      // File doesn't exist, ignore
    }
  }

  private async deleteFromS3(url: string): Promise<void> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    const filename = path.basename(url);
    await this.s3Client
      .deleteObject({
        Bucket: this.s3Bucket,
        Key: filename,
      })
      .promise();
  }
}

