import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('admin', 'public')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get settings (public)' })
  get() {
    return this.settingsService.get();
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch()
  @RequirePermissions('settings.write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update settings' })
  update(@Body() updateDto: unknown) {
    return this.settingsService.update(updateDto as Parameters<typeof this.settingsService.update>[0]);
  }
}

