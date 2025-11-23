import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { SettingsModule } from '../settings/settings.module';
import { TelegramModule } from './telegram/telegram.module';
import { AmoCRMModule } from './amocrm/amocrm.module';

@Module({
  imports: [SettingsModule, TelegramModule, AmoCRMModule],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}

