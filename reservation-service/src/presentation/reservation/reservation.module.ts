import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Reservation } from '../../domain/entities/reservation.entity';
import { ReservationDate } from '../../domain/entities/reservation-date.entity';
import { IdempotencyKey } from '../../domain/entities/idempotency-key.entity';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { ReservationRepository } from '../../infrastructure/repositories/reservation.repository';
import { IdempotencyKeyRepository } from '../../infrastructure/repositories/idempotency-key.repository';
import { HotelServiceClient } from '../../infrastructure/clients/hotel-service.client';
import { CreateReservationUseCase } from '../../application/use-cases/reservation/create-reservation.use-case';
import { GetAllReservationsUseCase } from '../../application/use-cases/reservation/get-all-reservations.use-case';
import { GetReservationByIdUseCase } from '../../application/use-cases/reservation/get-reservation-by-id.use-case';
import { UpdateReservationUseCase } from '../../application/use-cases/reservation/update-reservation.use-case';
import { CancelReservationUseCase } from '../../application/use-cases/reservation/cancel-reservation.use-case';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, ReservationDate, IdempotencyKey]),
    HttpModule,
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672'],
            queue: 'notification_queue',
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'PAYMENT_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672'],
            queue: 'payment_queue',
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    AuthModule,
  ],
  controllers: [ReservationController],
  providers: [
    ReservationService,
    ReservationRepository,
    IdempotencyKeyRepository,
    HotelServiceClient,
    {
      provide: 'IReservationRepository',
      useClass: ReservationRepository,
    },
    CreateReservationUseCase,
    GetAllReservationsUseCase,
    GetReservationByIdUseCase,
    UpdateReservationUseCase,
    CancelReservationUseCase,
  ],
})
export class ReservationModule {}
