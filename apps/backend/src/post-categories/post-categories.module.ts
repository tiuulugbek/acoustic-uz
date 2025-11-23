import { Module } from '@nestjs/common';
import { PostCategoriesService } from './post-categories.service';
import { PostCategoriesController } from './post-categories.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PostCategoriesController],
  providers: [PostCategoriesService],
  exports: [PostCategoriesService],
})
export class PostCategoriesModule {}

