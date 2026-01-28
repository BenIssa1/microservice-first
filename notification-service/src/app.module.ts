import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from './presentation/notification/notification.module';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { DatabaseConfig } from './infrastructure/database/database.config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),
    AuthModule,
    RabbitMQModule,
    NotificationModule,
  ],
})
export class AppModule {}
