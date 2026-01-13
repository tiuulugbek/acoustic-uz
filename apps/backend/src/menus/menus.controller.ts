import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('public', 'admin')
@Controller('menus')
export class MenusController {
  constructor(private readonly service: MenusService) {}

  @Public()
  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.service.findOne(name);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post(':name')
  @RequirePermissions('content.write')
  update(@Param('name') name: string, @Body() dto: { items: unknown }) {
    return this.service.update(name, dto.items);
  }
}

// Legacy route support: /api/menu -> /api/menus/header
@ApiTags('public', 'admin')
@Controller('menu')
export class MenuLegacyController {
  constructor(private readonly service: MenusService) {}

  @Public()
  @Get()
  findOne(@Query('name') name?: string) {
    // Default to 'header' if no name provided
    return this.service.findOne(name || 'header');
  }
}

