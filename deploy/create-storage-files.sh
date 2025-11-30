#!/bin/bash

# Storage fayllarini serverda yaratish scripti

cd /var/www/news.acoustic.uz

# Storage papkasini yaratish
mkdir -p apps/backend/src/media/storage

# storage.service.ts yaratish
cat > apps/backend/src/media/storage/storage.service.ts << 'STORAGESERVICE'
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
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
    this.uploadDir = path.join(process.cwd(), 'uploads');

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
    const date = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    
    let processedBuffer = file.buffer;
    let mimeType = file.mimetype;
    let size = file.size;
    let filename = file.originalname;

    const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const isImage = imageMimeTypes.includes(file.mimetype.toLowerCase());

    if (!skipWebp && isImage && file.mimetype !== 'image/webp') {
      try {
        processedBuffer = await sharp(file.buffer)
          .webp({ quality: 85, effort: 4 })
          .toBuffer();
        const nameWithoutExt = path.parse(file.originalname).name;
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}.webp`;
        mimeType = 'image/webp';
        size = processedBuffer.length;
      } catch (error) {
        console.warn('[StorageService] Failed to convert image to WebP:', error);
        const sanitizedName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        const ext = path.extname(file.originalname);
        filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}${ext}`;
      }
    } else if (skipWebp && isImage) {
      try {
        const image = sharp(file.buffer);
        const metadata = await image.metadata();
        const sanitizedName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        const maxWidth = 3072;
        const targetQuality = 75;
        
        if (metadata.width && metadata.width > maxWidth) {
          processedBuffer = await image
            .resize(maxWidth, null, { withoutEnlargement: true, fit: 'inside' })
            .jpeg({ quality: targetQuality, progressive: true, mozjpeg: true })
            .toBuffer();
          filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}.jpg`;
          mimeType = 'image/jpeg';
          size = processedBuffer.length;
          
          if (size > 5 * 1024 * 1024) {
            const smallerWidth = Math.floor(maxWidth * 0.75);
            processedBuffer = await image
              .resize(smallerWidth, null, { withoutEnlargement: true, fit: 'inside' })
              .jpeg({ quality: 70, progressive: true, mozjpeg: true })
              .toBuffer();
            filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}.jpg`;
            mimeType = 'image/jpeg';
            size = processedBuffer.length;
          }
        } else {
          processedBuffer = await image
            .jpeg({ quality: targetQuality, progressive: true, mozjpeg: true })
            .toBuffer();
          filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}.jpg`;
          mimeType = 'image/jpeg';
          size = processedBuffer.length;
        }
      } catch (error) {
        console.warn('[StorageService] Failed to optimize panorama image:', error);
        const sanitizedName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        const ext = path.extname(file.originalname);
        filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}${ext}`;
      }
    } else {
      const sanitizedName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const ext = path.extname(file.originalname);
      filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}${ext}`;
    }

    const filepath = path.join(this.uploadDir, filename);
    await fs.writeFile(filepath, processedBuffer);

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

    const date = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    
    let processedBuffer = file.buffer;
    let mimeType = file.mimetype;
    let size = file.size;
    let filename = file.originalname;

    const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const isImage = imageMimeTypes.includes(file.mimetype.toLowerCase());

    if (!skipWebp && isImage && file.mimetype !== 'image/webp') {
      try {
        processedBuffer = await sharp(file.buffer)
          .webp({ quality: 85, effort: 4 })
          .toBuffer();
        const nameWithoutExt = path.parse(file.originalname).name;
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}.webp`;
        mimeType = 'image/webp';
        size = processedBuffer.length;
      } catch (error) {
        console.warn('[StorageService] Failed to convert image to WebP:', error);
        const sanitizedName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        const ext = path.extname(file.originalname);
        filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}${ext}`;
      }
    } else {
      const sanitizedName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const ext = path.extname(file.originalname);
      filename = `${date}-${timestamp}-${sanitizedName}-${randomSuffix}${ext}`;
    }

    const key = `${date}/${filename}`;
    await this.s3Client
      .putObject({
        Bucket: this.s3Bucket,
        Key: key,
        Body: processedBuffer,
        ContentType: mimeType,
        ACL: 'public-read',
      })
      .promise();

    const url = this.configService.get<string>('S3_PUBLIC_URL') || `https://${this.s3Bucket}.s3.amazonaws.com`;
    return {
      url: `${url}/${key}`,
      filename,
      mimeType,
      size,
    };
  }

  async delete(url: string): Promise<void> {
    if (this.driver === 's3') {
      if (!this.s3Client) {
        throw new Error('S3 client not initialized');
      }
      const key = url.replace(/^https?:\/\/[^\/]+\//, '');
      await this.s3Client.deleteObject({ Bucket: this.s3Bucket, Key: key }).promise();
    } else {
      const filename = path.basename(url);
      const filepath = path.join(this.uploadDir, filename);
      try {
        await fs.unlink(filepath);
      } catch (error) {
        // File might not exist, ignore
      }
    }
  }
}
STORAGESERVICE

# storage.module.ts yaratish
cat > apps/backend/src/media/storage/storage.module.ts << 'STORAGEMODULE'
import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';

@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
STORAGEMODULE

echo "✅ Storage fayllari yaratildi!"

