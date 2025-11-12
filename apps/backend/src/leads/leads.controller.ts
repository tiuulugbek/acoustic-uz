import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('public', 'admin')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create lead (public)' })
  create(@Body() createDto: unknown) {
    return this.leadsService.create(createDto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get()
  @RequirePermissions('leads.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all leads' })
  findAll() {
    return this.leadsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get(':id')
  @RequirePermissions('leads.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lead by ID' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':id')
  @RequirePermissions('leads.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lead' })
  update(@Param('id') id: string, @Body() updateDto: { status?: string }) {
    return this.leadsService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':id')
  @RequirePermissions('leads.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete lead' })
  remove(@Param('id') id: string) {
    return this.leadsService.delete(id);
  }
}

