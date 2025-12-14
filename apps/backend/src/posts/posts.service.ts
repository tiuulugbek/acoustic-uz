import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(publicOnly = false, category?: string, postType?: string) {
    try {
      const where: any = publicOnly ? { status: 'published' } : {};
      if (category) {
        where.categoryId = category;
      }
      if (postType) {
        where.postType = postType;
      }
      const posts = await this.prisma.post.findMany({
        where,
        include: { 
          cover: true, 
          category: true, 
          author: { 
            include: { image: true } 
          } 
        },
        orderBy: { publishAt: 'desc' },
      });
      return posts;
    } catch (error) {
      console.error('Error in findAll:', error);
      console.error('Error details:', {
        publicOnly,
        category,
        postType,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async findOne(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: { cover: true, category: true, author: { include: { image: true } } },
    });
  }

  async findBySlug(slug: string, publicOnly = true) {
    return this.prisma.post.findFirst({
      where: { 
        slug,
        ...(publicOnly && { status: 'published' }),
      },
      include: { cover: true, category: true, author: { include: { image: true } } },
    });
  }

  async create(data: unknown) {
    try {
      const postData = data as any;
      
      // Normalize data - ensure required fields are present
      if (!postData.title_uz || !postData.title_ru) {
        throw new Error('Title (uz and ru) is required');
      }
      if (!postData.body_uz || !postData.body_ru) {
        throw new Error('Body (uz and ru) is required');
      }
      if (!postData.slug) {
        throw new Error('Slug is required');
      }
      
      // Normalize optional fields
      const normalizedData: any = {
        title_uz: postData.title_uz,
        title_ru: postData.title_ru,
        body_uz: postData.body_uz,
        body_ru: postData.body_ru,
        slug: postData.slug,
        postType: postData.postType || 'article',
        excerpt_uz: postData.excerpt_uz || null,
        excerpt_ru: postData.excerpt_ru || null,
        coverId: postData.coverId || null,
        categoryId: postData.categoryId || null,
        authorId: postData.authorId || null,
        status: postData.status || 'draft',
        publishAt: postData.publishAt ? new Date(postData.publishAt) : new Date(),
        tags: Array.isArray(postData.tags) ? postData.tags : (postData.tags ? postData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
      };
      
      return await this.prisma.post.create({ 
        data: normalizedData, 
        include: { cover: true, category: true, author: { include: { image: true } } } 
      });
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async update(id: string, data: unknown) {
    try {
      const postData = data as any;
      
      // Normalize optional fields
      const normalizedData: any = {};
      
      if (postData.title_uz !== undefined) normalizedData.title_uz = postData.title_uz;
      if (postData.title_ru !== undefined) normalizedData.title_ru = postData.title_ru;
      if (postData.body_uz !== undefined) normalizedData.body_uz = postData.body_uz;
      if (postData.body_ru !== undefined) normalizedData.body_ru = postData.body_ru;
      if (postData.slug !== undefined) normalizedData.slug = postData.slug;
      if (postData.postType !== undefined) normalizedData.postType = postData.postType;
      if (postData.excerpt_uz !== undefined) normalizedData.excerpt_uz = postData.excerpt_uz || null;
      if (postData.excerpt_ru !== undefined) normalizedData.excerpt_ru = postData.excerpt_ru || null;
      if (postData.coverId !== undefined) normalizedData.coverId = postData.coverId || null;
      if (postData.categoryId !== undefined) normalizedData.categoryId = postData.categoryId || null;
      if (postData.authorId !== undefined) normalizedData.authorId = postData.authorId || null;
      if (postData.status !== undefined) normalizedData.status = postData.status;
      if (postData.publishAt !== undefined) normalizedData.publishAt = new Date(postData.publishAt);
      if (postData.tags !== undefined) {
        normalizedData.tags = Array.isArray(postData.tags) 
          ? postData.tags 
          : (postData.tags ? postData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []);
      }
      
      return await this.prisma.post.update({ 
        where: { id }, 
        data: normalizedData, 
        include: { cover: true, category: true, author: { include: { image: true } } } 
      });
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  async delete(id: string) {
    return this.prisma.post.delete({ where: { id } });
  }
}

