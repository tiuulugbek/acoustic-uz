import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusController, MenuLegacyController } from './menus.controller';

@Module({
  controllers: [MenusController, MenuLegacyController],
  providers: [MenusService],
})
export class MenusModule {}

