import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { SettingsModule } from '../settings/settings.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [SettingsModule, TelegramModule],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}

