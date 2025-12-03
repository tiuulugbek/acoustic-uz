import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HearingTestService } from './hearing-test.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('public', 'admin')
@Controller('hearing-test')
export class HearingTestController {
  constructor(private readonly hearingTestService: HearingTestService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit hearing test results (public)' })
  create(@Body() createDto: unknown) {
    return this.hearingTestService.create(createDto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get()
  @RequirePermissions('leads.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all hearing tests' })
  findAll() {
    return this.hearingTestService.findAll();
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get(':id')
  @RequirePermissions('leads.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get hearing test by ID' })
  findOne(@Param('id') id: string) {
    return this.hearingTestService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':id')
  @RequirePermissions('leads.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update hearing test status' })
  update(@Param('id') id: string, @Body() updateDto: { status?: string; notes?: string }) {
    return this.hearingTestService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':id')
  @RequirePermissions('leads.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete hearing test' })
  remove(@Param('id') id: string) {
    return this.hearingTestService.delete(id);
  }
}

