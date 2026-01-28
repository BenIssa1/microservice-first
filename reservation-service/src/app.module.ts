import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationModule } from './presentation/reservation/reservation.module';
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
    ReservationModule,
  ],
})
export class AppModule {}
