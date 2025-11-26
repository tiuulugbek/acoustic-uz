import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AvailabilityStatusesService } from './availability-statuses.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Prisma } from '@prisma/client';

@ApiTags('public', 'admin')
@Controller('availability-statuses')
export class AvailabilityStatusesController {
  constructor(private readonly service: AvailabilityStatusesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all availability statuses (public)' })
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get(':key')
  @ApiOperation({ summary: 'Get availability status by key (public)' })
  findByKey(@Param('key') key: string) {
    return this.service.findByKey(key);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':key')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update availability status' })
  update(@Param('key') key: string, @Body() data: Prisma.AvailabilityStatusUpdateInput) {
    return this.service.update(key, data);
  }
}

