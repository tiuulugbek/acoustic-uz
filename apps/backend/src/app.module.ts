import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { MediaModule } from './media/media.module';
import { SettingsModule } from './settings/settings.module';
import { BannersModule } from './banners/banners.module';
import { ServicesModule } from './services/services.module';
import { BrandsModule } from './brands/brands.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { ServiceCategoriesModule } from './service-categories/service-categories.module';
import { ProductsModule } from './products/products.module';
import { ShowcasesModule } from './showcases/showcases.module';
import { PostsModule } from './posts/posts.module';
import { FaqModule } from './faq/faq.module';
import { BranchesModule } from './branches/branches.module';
import { PagesModule } from './pages/pages.module';
import { LeadsModule } from './leads/leads.module';
import { SearchModule } from './search/search.module';
import { MenusModule } from './menus/menus.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { HomepageModule } from './homepage/homepage.module';
import { LocaleCacheInterceptor } from './common/interceptors/locale-cache.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env.local',
        '.env',
        join(__dirname, '..', '.env.local'),
        join(__dirname, '..', '.env'),
        join(__dirname, '..', '..', '.env'),
        join(__dirname, '..', '..', '..', '.env'),
      ],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get('NODE_ENV') === 'production' ? 'info' : 'debug',
          transport:
            configService.get('NODE_ENV') !== 'production'
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                  },
                }
              : undefined,
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('RATE_LIMIT_TTL', 60),
            limit: configService.get<number>('RATE_LIMIT_MAX', 100),
          },
        ],
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    MediaModule,
    SettingsModule,
    BannersModule,
    ServicesModule,
    BrandsModule,
    ProductCategoriesModule,
    ServiceCategoriesModule,
    ProductsModule,
    ShowcasesModule,
    PostsModule,
    FaqModule,
    BranchesModule,
    PagesModule,
    LeadsModule,
    SearchModule,
    MenusModule,
    AuditLogModule,
    HomepageModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LocaleCacheInterceptor,
    },
  ],
})
export class AppModule {}

