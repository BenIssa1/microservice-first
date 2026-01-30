import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateReservationUseCase } from '../../application/use-cases/reservation/create-reservation.use-case';
import { GetAllReservationsUseCase } from '../../application/use-cases/reservation/get-all-reservations.use-case';
import { GetReservationByIdUseCase } from '../../application/use-cases/reservation/get-reservation-by-id.use-case';
import { UpdateReservationUseCase } from '../../application/use-cases/reservation/update-reservation.use-case';
import { CancelReservationUseCase } from '../../application/use-cases/reservation/cancel-reservation.use-case';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationStatus } from '../../domain/entities/reservation.entity';

@Injectable()
export class ReservationService {
  constructor(
    private readonly createReservationUseCase: CreateReservationUseCase,
    private readonly getAllReservationsUseCase: GetAllReservationsUseCase,
    private readonly getReservationByIdUseCase: GetReservationByIdUseCase,
    private readonly updateReservationUseCase: UpdateReservationUseCase,
    private readonly cancelReservationUseCase: CancelReservationUseCase,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
  ) {}

  async findAll(userId?: number) {
    return await this.getAllReservationsUseCase.execute(userId);
  }

  async findOne(id: number) {
    return await this.getReservationByIdUseCase.execute(id);
  }

  async create(createReservationDto: CreateReservationDto & { idempotency_key?: string }) {
    const result = await this.createReservationUseCase.execute({
      ...createReservationDto,
      check_in: new Date(createReservationDto.check_in),
      check_out: new Date(createReservationDto.check_out),
    });

    const { reservation, isNew } = result;

    // Only publish events if this is a new reservation (not a duplicate request)
    if (isNew) {
      // Publish event for payment (NestJS microservices)
      this.paymentClient.emit('payment.required', {
        reservationId: reservation.id,
        amount: reservation.total_price,
        userId: reservation.user_id,
      }).subscribe();

      // Publish event for notification (NestJS microservices)
      this.notificationClient.emit('reservation.created', {
        reservationId: reservation.id,
        userId: reservation.user_id,
        hotelId: reservation.hotel_id,
      }).subscribe();
    }

    return reservation;
  }

  async update(id: number, updateReservationDto: UpdateReservationDto) {
    const reservation = await this.updateReservationUseCase.execute(id, updateReservationDto);
    
    if (updateReservationDto.status === ReservationStatus.CONFIRMED) {
      this.notificationClient.emit('reservation.confirmed', {
        reservationId: reservation.id,
        userId: reservation.user_id,
      }).subscribe();
    }

    return reservation;
  }

  async cancel(id: number) {
    await this.cancelReservationUseCase.execute(id);
    
    this.notificationClient.emit('reservation.cancelled', {
      reservationId: id,
    }).subscribe();
  }
}
