import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { RabbitMQModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, ReservationDate, IdempotencyKey]),
    HttpModule,
    RabbitMQModule,
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
