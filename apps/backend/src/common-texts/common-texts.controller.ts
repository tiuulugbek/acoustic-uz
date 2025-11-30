import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommonTextsService } from './common-texts.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

@ApiTags('public', 'admin')
@Controller('common-texts')
export class CommonTextsController {
  constructor(private readonly service: CommonTextsService) {}

  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post()
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  create(@Body() data: Prisma.CommonTextCreateInput) {
    return this.service.upsert(data.key, data);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':key')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  update(@Param('key') key: string, @Body() data: Prisma.CommonTextUpdateInput) {
    return this.service.upsert(key, data as Prisma.CommonTextCreateInput);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':key')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  delete(@Param('key') key: string) {
    return this.service.delete(key);
  }
}
