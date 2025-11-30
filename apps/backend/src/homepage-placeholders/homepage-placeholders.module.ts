import { Module } from '@nestjs/common';
import { HomepagePlaceholdersService } from './homepage-placeholders.service';
import { HomepagePlaceholdersController } from './homepage-placeholders.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HomepagePlaceholdersController],
  providers: [HomepagePlaceholdersService],
  exports: [HomepagePlaceholdersService],
})
export class HomepagePlaceholdersModule {}
