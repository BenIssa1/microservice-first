import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors();

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Hotel Booking System - API Gateway')
    .setDescription('API Gateway for Hotel Booking Microservices')
    .setVersion('1.0')
    .addTag('hotels', 'Hotel management endpoints')
    .addTag('reservations', 'Reservation management endpoints')
    .addTag('payments', 'Payment processing endpoints')
    .addTag('notifications', 'Notification endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('auth', 'Authentication endpoints')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });
  
  // Log available tags for debugging
  const tags = Object.keys(document.tags || {});
  console.log('Swagger tags detected:', tags);
  console.log('Swagger paths:', Object.keys(document.paths || {}));
  
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
  
  await app.listen(3000);
  console.log('API Gateway is running on http://localhost:3000');
  console.log('Swagger documentation available at http://localhost:3000/api');
}
bootstrap();
