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
    .setTitle('User Service API')
    .setDescription('User management microservice')
    .setVersion('1.0')
    .addTag('users', 'User operations')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  
  const port = process.env.PORT || 3005;
  await app.listen(port);
  console.log(`User Service is running on http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api`);
}
bootstrap();
