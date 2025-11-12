import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('public', 'admin')
@Controller('faq')
export class FaqController {
  constructor(private readonly service: FaqService) {}

  @Public()
  @Get()
  findAll(@Query('public') publicOnly?: string) {
    return this.service.findAll(publicOnly === 'true');
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post()
  @RequirePermissions('content.write')
  create(@Body() dto: unknown) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':id')
  @RequirePermissions('content.write')
  update(@Param('id') id: string, @Body() dto: unknown) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':id')
  @RequirePermissions('content.write')
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

