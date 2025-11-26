import { Module } from '@nestjs/common';
import { HomepageLinksService } from './homepage-links.service';
import { HomepageLinksController } from './homepage-links.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HomepageLinksController],
  providers: [HomepageLinksService],
  exports: [HomepageLinksService],
})
export class HomepageLinksModule {}

