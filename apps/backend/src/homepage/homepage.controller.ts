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
import { HomepageService } from './homepage.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('public', 'admin')
@Controller('homepage')
export class HomepageController {
  constructor(private readonly homepage: HomepageService) {}

  @Public()
  @Get('hearing-aids')
  findPublicHearingAids() {
    return this.homepage.findHearingAids(true);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('hearing-aids/admin')
  @RequirePermissions('content.read')
  @ApiBearerAuth()
  findAllHearingAids() {
    return this.homepage.findHearingAids(false);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post('hearing-aids')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  createHearingAid(@Body() dto: unknown) {
    return this.homepage.createHearingAid(dto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch('hearing-aids/:id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  updateHearingAid(@Param('id') id: string, @Body() dto: unknown) {
    return this.homepage.updateHearingAid(id, dto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete('hearing-aids/:id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  deleteHearingAid(@Param('id') id: string) {
    return this.homepage.deleteHearingAid(id);
  }

  @Public()
  @Get('journey')
  findPublicJourney() {
    return this.homepage.findJourney(true);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('journey/admin')
  @RequirePermissions('content.read')
  @ApiBearerAuth()
  findAllJourney() {
    return this.homepage.findJourney(false);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post('journey')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  createJourney(@Body() dto: unknown) {
    return this.homepage.createJourneyStep(dto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch('journey/:id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  updateJourney(@Param('id') id: string, @Body() dto: unknown) {
    return this.homepage.updateJourneyStep(id, dto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete('journey/:id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  deleteJourney(@Param('id') id: string) {
    return this.homepage.deleteJourneyStep(id);
  }

  @Public()
  @Get('news')
  findPublicNews() {
    return this.homepage.findNews(true);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('news/admin')
  @RequirePermissions('content.read')
  @ApiBearerAuth()
  findAllNews() {
    return this.homepage.findNews(false);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post('news')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  createNews(@Body() dto: unknown) {
    return this.homepage.createNewsItem(dto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch('news/:id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  updateNews(@Param('id') id: string, @Body() dto: unknown) {
    return this.homepage.updateNewsItem(id, dto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete('news/:id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  deleteNews(@Param('id') id: string) {
    return this.homepage.deleteNewsItem(id);
  }

  @Public()
  @Get('services')
  findPublicServices() {
    return this.homepage.findServices(true);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('services/admin')
  @RequirePermissions('content.read')
  @ApiBearerAuth()
  findAllServices() {
    return this.homepage.findServices(false);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post('services')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  createService(@Body() dto: unknown) {
    return this.homepage.createService(dto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch('services/:id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  updateService(@Param('id') id: string, @Body() dto: unknown) {
    return this.homepage.updateService(id, dto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete('services/:id')
  @RequirePermissions('content.write')
  @ApiBearerAuth()
  deleteService(@Param('id') id: string) {
    return this.homepage.deleteService(id);
  }
}
