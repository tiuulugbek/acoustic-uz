import { Module } from '@nestjs/common';
import { CommonTextsService } from './common-texts.service';
import { CommonTextsController } from './common-texts.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CommonTextsController],
  providers: [CommonTextsService],
  exports: [CommonTextsService],
})
export class CommonTextsModule {}
