import { Module } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { CatalogsController, CatalogLegacyController } from './catalogs.controller';

@Module({
  controllers: [CatalogsController, CatalogLegacyController],
  providers: [CatalogsService],
  exports: [CatalogsService],
})
export class CatalogsModule {}



