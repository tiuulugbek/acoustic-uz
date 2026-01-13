import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('public', 'admin')
@Controller('posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Public()
  @Get()
  async findAll(
    @Query('public') publicOnly?: string, 
    @Query('categoryId') categoryId?: string,
    @Query('postType') postType?: string
  ) {
    try {
      const result = await this.service.findAll(publicOnly === 'true', categoryId, postType);
      return result;
    } catch (error) {
      console.error('Error fetching posts:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      // Return empty array instead of throwing to prevent 500 error
      // This allows the frontend to handle the error gracefully
      return [];
    }
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string, @Query('public') publicOnly?: string) {
    return this.service.findBySlug(slug, publicOnly === 'true');
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post()
  @RequirePermissions('content.write')
  async create(@Body() dto: unknown) {
    try {
      return await this.service.create(dto);
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
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

