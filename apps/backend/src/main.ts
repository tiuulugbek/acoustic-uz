import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  app.useLogger(logger);

  // Security - Configure helmet to allow cross-origin images
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cookieParser());

  // CORS
  const corsOriginsEnv = configService.get<string>('CORS_ORIGIN', '');
  const defaultOrigins = [
    'https://admin.acoustic.uz',
    'https://acoustic.uz',
    'http://localhost:3000',
    'http://localhost:5173',
  ];
  
  let corsOrigins: string[] | boolean | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
  if (corsOriginsEnv) {
    // Merge environment origins with defaults
    const envOrigins = corsOriginsEnv.split(',').map(origin => origin.trim()).filter(Boolean);
    corsOrigins = [...new Set([...defaultOrigins, ...envOrigins])];
  } else {
    // If no CORS_ORIGIN env var, use callback function to allow all origins
    corsOrigins = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
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
    ? join(process.cwd(), 'uploads')
    : join(process.cwd(), 'apps', 'backend', 'uploads');
  
  logger.log(`📁 Serving static files from: ${uploadsPath}`);
  
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: false, // Disable whitelist to allow all fields from Prisma
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global prefix (applies to controllers, not static assets)
  app.setGlobalPrefix('api');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Acoustic.uz API')
    .setDescription('API documentation for acoustic.uz')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .addTag('auth', 'Authentication endpoints')
    .addTag('public', 'Public endpoints')
    .addTag('admin', 'Admin endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

