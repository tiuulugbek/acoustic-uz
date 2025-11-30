import { Module } from '@nestjs/common';
import { AvailabilityStatusesService } from './availability-statuses.service';
import { AvailabilityStatusesController } from './availability-statuses.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AvailabilityStatusesController],
  providers: [AvailabilityStatusesService],
  exports: [AvailabilityStatusesService],
})
export class AvailabilityStatusesModule {}
