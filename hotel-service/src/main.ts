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

  // Swagger : uniquement en dev/staging (pas en production)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Hotel Service API')
      .setDescription('Hotel management microservice')
      .setVersion('1.0')
      .addTag('hotels', 'Hotel operations')
      .addTag('rooms', 'Room operations')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    console.log('Swagger documentation available at /api');
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Hotel Service is running on http://localhost:${port}`);
}
bootstrap();
