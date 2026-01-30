import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors();

  // Microservice RabbitMQ : écoute sur notification_queue (événements user.registered, etc.)
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672'],
      queue: 'notification_queue',
      queueOptions: { durable: true },
    },
  });
  await app.startAllMicroservices();

  // Swagger : uniquement en dev/staging (pas en production)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Notification Service API')
      .setDescription('Notification management microservice')
      .setVersion('1.0')
      .addTag('notifications', 'Notification operations')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    console.log('Swagger documentation available at /api');
  }

  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`Notification Service is running on http://localhost:${port}`);
}
bootstrap();
