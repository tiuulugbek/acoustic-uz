"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
const nestjs_pino_1 = require("nestjs-pino");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const configService = app.get(config_1.ConfigService);
    const logger = app.get(nestjs_pino_1.Logger);
    app.useLogger(logger);
    // Security - Configure helmet to allow cross-origin images
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginEmbedderPolicy: false,
    }));
    app.use((0, cookie_parser_1.default)());
    // CORS
    const corsOriginsEnv = configService.get('CORS_ORIGIN', '');
    const defaultOrigins = [
        'https://admin.acoustic.uz',
        'https://acoustic.uz',
        'http://localhost:3000',
        'http://localhost:5173',
    ];
    let corsOrigins;
    if (corsOriginsEnv) {
        // Merge environment origins with defaults
        const envOrigins = corsOriginsEnv.split(',').map(origin => origin.trim()).filter(Boolean);
        corsOrigins = [...new Set([...defaultOrigins, ...envOrigins])];
    }
    else {
        // If no CORS_ORIGIN env var, use callback function to allow all origins
        corsOrigins = (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin)
                return callback(null, true);
            // Allow all origins
            callback(null, true);
        };
    }
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Locale', 'Accept', 'Origin', 'X-Requested-With'],
        exposedHeaders: ['Vary', 'Cache-Control'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });
    logger.log(`🌐 CORS enabled for origins: ${Array.isArray(corsOrigins) ? corsOrigins.join(', ') : 'all (with callback)'}`);
    // Serve static files from uploads directory - BEFORE global prefix
    // This allows /uploads/ to work without /api prefix
    // Use explicit path: if cwd is project root, use apps/backend/uploads
    // If cwd is backend root, use uploads
    const uploadsPath = process.cwd().endsWith('backend')
        ? (0, path_1.join)(process.cwd(), 'uploads')
        : (0, path_1.join)(process.cwd(), 'apps', 'backend', 'uploads');
    logger.log(`📁 Serving static files from: ${uploadsPath}`);
    app.useStaticAssets(uploadsPath, {
        prefix: '/uploads/',
    });
    // Validation
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: false, // Disable whitelist to allow all fields from Prisma
        forbidNonWhitelisted: false,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    // Global prefix (applies to controllers, not static assets)
    app.setGlobalPrefix('api');
    // Swagger
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Acoustic.uz API')
        .setDescription('API documentation for acoustic.uz')
        .setVersion('1.0')
        .addBearerAuth()
        .addCookieAuth('access_token')
        .addTag('auth', 'Authentication endpoints')
        .addTag('public', 'Public endpoints')
        .addTag('admin', 'Admin endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = configService.get('PORT', 3001);
    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map