import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommonTextsService } from './common-texts.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Prisma } from '@prisma/client';

@ApiTags('public', 'admin')
@Controller('common-texts')
export class CommonTextsController {
  constructor(private readonly service: CommonTextsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all common texts (public)' })
  @ApiQuery({ name: 'category', required: false })
  findAll(@Query('category') category?: string) {
    return this.service.findAll(category);
  }

  @Public()
  @Get(':key')
  @ApiOperation({ summary: 'Get common text by key (public)' })
  findByKey(@Param('key') key: string) {
    return this.service.findByKey(key);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':key')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update common text' })
  update(@Param('key') key: string, @Body() data: Prisma.CommonTextCreateInput) {
    return this.service.upsert(key, data);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':key')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete common text' })
  delete(@Param('key') key: string) {
    return this.service.delete(key);
  }
}

