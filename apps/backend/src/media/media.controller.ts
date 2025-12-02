import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UploadedFile as StoredFile } from './storage/storage.service';

@ApiTags('admin')
@Controller('media')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @RequirePermissions('media.read')
  @ApiOperation({ summary: 'Get all media' })
  findAll() {
    return this.mediaService.findAll();
  }

  @Get(':id')
  @RequirePermissions('media.read')
  @ApiOperation({ summary: 'Get media by ID' })
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Post()
  @RequirePermissions('media.write')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        // Faqat rasm fayllarini qabul qilish
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Faqat rasm fayllari qabul qilinadi'), false);
        }
        cb(null, true);
      },
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        alt_uz: { type: 'string' },
        alt_ru: { type: 'string' },
        skipWebp: { type: 'boolean', description: 'Skip WebP conversion (useful for panorama images)' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload media' })
  upload(
    @UploadedFile() file: StoredFile,
    @Body('alt_uz') alt_uz?: string,
    @Body('alt_ru') alt_ru?: string,
    @Body('skipWebp') skipWebp?: string
  ) {
    if (!file) {
      throw new BadRequestException('Rasm fayli yuborilmadi');
    }
    const shouldSkipWebp = skipWebp === 'true';
    return this.mediaService.create(file, alt_uz, alt_ru, shouldSkipWebp);
  }

  @Patch(':id')
  @RequirePermissions('media.write')
  @ApiOperation({ summary: 'Update media' })
  update(@Param('id') id: string, @Body() updateDto: { alt_uz?: string; alt_ru?: string }) {
    return this.mediaService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('media.write')
  @ApiOperation({ summary: 'Delete media' })
  remove(@Param('id') id: string) {
    return this.mediaService.delete(id);
  }
}

