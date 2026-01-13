"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const nestjs_pino_1 = require("nestjs-pino");
const path_1 = require("path");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const roles_module_1 = require("./roles/roles.module");
const media_module_1 = require("./media/media.module");
const settings_module_1 = require("./settings/settings.module");
const banners_module_1 = require("./banners/banners.module");
const services_module_1 = require("./services/services.module");
const brands_module_1 = require("./brands/brands.module");
const product_categories_module_1 = require("./product-categories/product-categories.module");
const service_categories_module_1 = require("./service-categories/service-categories.module");
const catalogs_module_1 = require("./catalogs/catalogs.module");
const products_module_1 = require("./products/products.module");
const showcases_module_1 = require("./showcases/showcases.module");
const posts_module_1 = require("./posts/posts.module");
const faq_module_1 = require("./faq/faq.module");
const branches_module_1 = require("./branches/branches.module");
const pages_module_1 = require("./pages/pages.module");
const leads_module_1 = require("./leads/leads.module");
const search_module_1 = require("./search/search.module");
const menus_module_1 = require("./menus/menus.module");
const audit_log_module_1 = require("./audit-log/audit-log.module");
const homepage_module_1 = require("./homepage/homepage.module");
const doctors_module_1 = require("./doctors/doctors.module");
const hearing_test_module_1 = require("./hearing-test/hearing-test.module");
const locale_cache_interceptor_1 = require("./common/interceptors/locale-cache.interceptor");
let AppModule = (() => {
    let _classDecorators = [(0, common_1.Module)({
            imports: [
                config_1.ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: [
                        '.env.local',
                        '.env',
                        (0, path_1.join)(__dirname, '..', '.env.local'),
                        (0, path_1.join)(__dirname, '..', '.env'),
                        (0, path_1.join)(__dirname, '..', '..', '.env'),
                        (0, path_1.join)(__dirname, '..', '..', '..', '.env'),
                    ],
                }),
                nestjs_pino_1.LoggerModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (configService) => ({
                        pinoHttp: {
                            level: configService.get('NODE_ENV') === 'production' ? 'info' : 'debug',
                            transport: configService.get('NODE_ENV') !== 'production'
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
                throttler_1.ThrottlerModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: async (configService) => ({
                        throttlers: [
                            {
                                ttl: configService.get('RATE_LIMIT_TTL', 60),
                                limit: configService.get('RATE_LIMIT_MAX', 100),
                            },
                        ],
                    }),
                }),
                prisma_module_1.PrismaModule,
                auth_module_1.AuthModule,
                users_module_1.UsersModule,
                roles_module_1.RolesModule,
                media_module_1.MediaModule,
                settings_module_1.SettingsModule,
                banners_module_1.BannersModule,
                services_module_1.ServicesModule,
                brands_module_1.BrandsModule,
                product_categories_module_1.ProductCategoriesModule,
                service_categories_module_1.ServiceCategoriesModule,
                catalogs_module_1.CatalogsModule,
                products_module_1.ProductsModule,
                showcases_module_1.ShowcasesModule,
                posts_module_1.PostsModule,
                faq_module_1.FaqModule,
                branches_module_1.BranchesModule,
                pages_module_1.PagesModule,
                leads_module_1.LeadsModule,
                search_module_1.SearchModule,
                menus_module_1.MenusModule,
                audit_log_module_1.AuditLogModule,
                homepage_module_1.HomepageModule,
                doctors_module_1.DoctorsModule,
                hearing_test_module_1.HearingTestModule,
            ],
            providers: [
                {
                    provide: core_1.APP_GUARD,
                    useClass: throttler_1.ThrottlerGuard,
                },
                {
                    provide: core_1.APP_INTERCEPTOR,
                    useClass: locale_cache_interceptor_1.LocaleCacheInterceptor,
                },
            ],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AppModule = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AppModule = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return AppModule = _classThis;
})();
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map