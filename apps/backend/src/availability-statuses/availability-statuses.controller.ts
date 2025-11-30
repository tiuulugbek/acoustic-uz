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
import { AvailabilityStatusesService } from './availability-statuses.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

@ApiTags('public', 'admin')
@Controller('availability-statuses')
export class AvailabilityStatusesController {
  constructor(private readonly service: AvailabilityStatusesService) {}

  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post()
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  create(@Body() data: Prisma.AvailabilityStatusCreateInput) {
    return this.service.create(data);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':key')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  update(@Param('key') key: string, @Body() data: Prisma.AvailabilityStatusUpdateInput) {
    return this.service.update(key, data);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':key')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  delete(@Param('key') key: string) {
    return this.service.delete(key);
  }
}
