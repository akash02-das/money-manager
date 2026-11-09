import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParserModule from 'cookie-parser';
import { AppModule } from './app.module';

// Resolve CommonJS function export vs ESM default export
const cookieParser =
  typeof cookieParserModule === 'function'
    ? cookieParserModule
    : (cookieParserModule as any).default || cookieParserModule;

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
  const cookieSecret = configService.get<string>('COOKIE_SECRET', 'default-cookie-secret');

  // Security & Parsing Middlewares
  app.use(cookieParser(cookieSecret));

  // CORS Configuration
  app.enableCors({
    origin: corsOrigin.includes(',')
      ? corsOrigin.split(',').map((origin) => origin.trim())
      : corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global Route Prefix (/api/v1)
  app.setGlobalPrefix(apiPrefix);

  // Global Validation Pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  // OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Money Manager API')
    .setDescription(
      'Robust, precision-engineered REST API for personal finance management, accounts, categories, transactions, and budgets.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
    },
  });

  await app.listen(port);

  logger.log(`==================================================================`);
  logger.log(`🚀 Money Manager Backend is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Swagger Documentation is available at: http://localhost:${port}/api/docs`);
  logger.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`==================================================================`);
}

bootstrap();
