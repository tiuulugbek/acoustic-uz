import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService, UploadedFile } from './storage/storage.service';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService
  ) {}

  async findAll() {
    return this.prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return media;
  }

  async create(file: UploadedFile, alt_uz?: string, alt_ru?: string) {
    const uploadResult = await this.storageService.upload(file);

    return this.prisma.media.create({
      data: {
        url: uploadResult.url,
        filename: uploadResult.filename,
        mimeType: uploadResult.mimeType,
        size: uploadResult.size,
        alt_uz,
        alt_ru,
      },
    });
  }

  async update(id: string, data: { alt_uz?: string; alt_ru?: string }) {
    return this.prisma.media.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const media = await this.findOne(id);

    await this.storageService.delete(media.url);

    return this.prisma.media.delete({
      where: { id },
    });
  }
}

