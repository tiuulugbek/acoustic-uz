import { Module } from '@nestjs/common';
import { HomepageEmptyStatesService } from './homepage-empty-states.service';
import { HomepageEmptyStatesController } from './homepage-empty-states.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HomepageEmptyStatesController],
  providers: [HomepageEmptyStatesService],
  exports: [HomepageEmptyStatesService],
})
export class HomepageEmptyStatesModule {}
