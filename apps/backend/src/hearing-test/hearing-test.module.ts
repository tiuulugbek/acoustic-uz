import { Module } from '@nestjs/common';
import { HearingTestController } from './hearing-test.controller';
import { HearingTestService } from './hearing-test.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TelegramModule } from '../leads/telegram/telegram.module';

@Module({
  imports: [PrismaModule, TelegramModule],
  controllers: [HearingTestController],
  providers: [HearingTestService],
  exports: [HearingTestService],
})
export class HearingTestModule {}

