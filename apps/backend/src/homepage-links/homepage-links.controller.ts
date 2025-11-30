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
import { HomepageLinksService } from './homepage-links.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

@ApiTags('public', 'admin')
@Controller('homepage/links')
export class HomepageLinksController {
  constructor(private readonly service: HomepageLinksService) {}

  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post()
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  create(@Body() data: Prisma.HomepageLinkCreateInput) {
    return this.service.create(data);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() data: Prisma.HomepageLinkUpdateInput) {
    return this.service.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
