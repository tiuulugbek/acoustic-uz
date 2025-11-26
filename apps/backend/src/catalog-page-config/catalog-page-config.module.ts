import { Module } from '@nestjs/common';
import { CatalogPageConfigService } from './catalog-page-config.service';
import { CatalogPageConfigController } from './catalog-page-config.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CatalogPageConfigController],
  providers: [CatalogPageConfigService],
  exports: [CatalogPageConfigService],
})
export class CatalogPageConfigModule {}

