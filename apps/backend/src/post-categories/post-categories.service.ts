import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostCategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(section?: string) {
    try {
      const where: any = {};
      if (section) {
        where.section = section;
      }
      return this.prisma.postCategory.findMany({
        where,
        include: { image: true },
        orderBy: [{ order: 'asc' }, { name_uz: 'asc' }],
      });
    } catch (error) {
      console.error('Error fetching post categories:', error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.prisma.postCategory.findUnique({
        where: { id },
        include: { image: true },
      });
      if (!category) {
        throw new NotFoundException(`Post category with ID ${id} not found`);
      }
      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching post category:', error);
      throw error;
    }
  }

  async findBySlug(slug: string) {
    try {
      return this.prisma.postCategory.findFirst({
        where: { slug },
        include: { image: true },
      });
    } catch (error) {
      console.error('Error fetching post category by slug:', error);
      throw error;
    }
  }

  async create(data: unknown) {
    try {
      const { imageId, ...rest } = data as any;
      
      // Validate required fields
      if (!rest.name_uz || !rest.name_ru || !rest.slug) {
        throw new BadRequestException('name_uz, name_ru, and slug are required');
      }

      // Check if slug already exists
      const existing = await this.prisma.postCategory.findUnique({
        where: { slug: rest.slug },
      });
      if (existing) {
        throw new ConflictException(`Category with slug "${rest.slug}" already exists`);
      }

      // Validate imageId if provided
      if (imageId) {
        const image = await this.prisma.media.findUnique({
          where: { id: imageId },
        });
        if (!image) {
          throw new BadRequestException(`Image with ID ${imageId} not found`);
        }
      }

      const createData: Prisma.PostCategoryCreateInput = {
        ...rest,
      };

      // Only add image relation if imageId is provided and not empty
      if (imageId && imageId.trim() !== '') {
        createData.image = { connect: { id: imageId } };
      }

      return this.prisma.postCategory.create({
        data: createData,
        include: { image: true },
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = (error.meta as any)?.target?.[0] || 'field';
          throw new ConflictException(`Category with this ${field} already exists`);
        }
      }
      console.error('Error creating post category:', error);
      throw new BadRequestException('Failed to create post category');
    }
  }

  async update(id: string, data: unknown) {
    try {
      // Check if category exists
      const existing = await this.prisma.postCategory.findUnique({
        where: { id },
      });
      if (!existing) {
        throw new NotFoundException(`Post category with ID ${id} not found`);
      }

      const { imageId, ...rest } = data as any;

      // If slug is being updated, check if it already exists
      if (rest.slug && rest.slug !== existing.slug) {
        const slugExists = await this.prisma.postCategory.findUnique({
          where: { slug: rest.slug },
        });
        if (slugExists) {
          throw new ConflictException(`Category with slug "${rest.slug}" already exists`);
        }
      }

      // Validate imageId if provided
      if (imageId !== undefined && imageId !== null && imageId.trim() !== '') {
        const image = await this.prisma.media.findUnique({
          where: { id: imageId },
        });
        if (!image) {
          throw new BadRequestException(`Image with ID ${imageId} not found`);
        }
      }

      const updateData: Prisma.PostCategoryUpdateInput = {
        ...rest,
      };

      // Handle image relation
      if (imageId !== undefined) {
        if (imageId === null || imageId === '' || imageId.trim() === '') {
          // Disconnect image if imageId is null or empty
          updateData.image = { disconnect: true };
        } else {
          // Connect image if imageId is provided
          updateData.image = { connect: { id: imageId } };
        }
      }

      return this.prisma.postCategory.update({
        where: { id },
        data: updateData,
        include: { image: true },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = (error.meta as any)?.target?.[0] || 'field';
          throw new ConflictException(`Category with this ${field} already exists`);
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(`Post category with ID ${id} not found`);
        }
      }
      console.error('Error updating post category:', error);
      throw new BadRequestException('Failed to update post category');
    }
  }

  async delete(id: string) {
    try {
      const category = await this.prisma.postCategory.findUnique({
        where: { id },
        include: { posts: true },
      });
      if (!category) {
        throw new NotFoundException(`Post category with ID ${id} not found`);
      }
      return this.prisma.postCategory.delete({ where: { id } });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting post category:', error);
      throw new BadRequestException('Failed to delete post category');
    }
  }
}









