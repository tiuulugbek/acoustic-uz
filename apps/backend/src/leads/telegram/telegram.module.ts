import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SettingsModule } from '../../settings/settings.module';
import { TelegramService } from './telegram.service';

@Module({
  imports: [ConfigModule, SettingsModule],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}

