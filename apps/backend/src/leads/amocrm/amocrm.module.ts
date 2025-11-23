import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SettingsModule } from '../../settings/settings.module';
import { AmoCRMService } from './amocrm.service';
import { AmoCRMController } from './amocrm.controller';

@Module({
  imports: [HttpModule, ConfigModule, SettingsModule],
  controllers: [AmoCRMController],
  providers: [AmoCRMService],
  exports: [AmoCRMService],
})
export class AmoCRMModule {}


