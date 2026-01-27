import { Injectable } from '@nestjs/common';
import { CreateReservationUseCase } from '../../application/use-cases/reservation/create-reservation.use-case';
import { GetAllReservationsUseCase } from '../../application/use-cases/reservation/get-all-reservations.use-case';
import { GetReservationByIdUseCase } from '../../application/use-cases/reservation/get-reservation-by-id.use-case';
import { UpdateReservationUseCase } from '../../application/use-cases/reservation/update-reservation.use-case';
import { CancelReservationUseCase } from '../../application/use-cases/reservation/cancel-reservation.use-case';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { ReservationStatus } from '../../domain/entities/reservation.entity';

@Injectable()
export class ReservationService {
  constructor(
    private readonly createReservationUseCase: CreateReservationUseCase,
    private readonly getAllReservationsUseCase: GetAllReservationsUseCase,
    private readonly getReservationByIdUseCase: GetReservationByIdUseCase,
    private readonly updateReservationUseCase: UpdateReservationUseCase,
    private readonly cancelReservationUseCase: CancelReservationUseCase,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async findAll(userId?: number) {
    return await this.getAllReservationsUseCase.execute(userId);
  }

  async findOne(id: number) {
    return await this.getReservationByIdUseCase.execute(id);
  }

  async create(createReservationDto: CreateReservationDto) {
    const reservation = await this.createReservationUseCase.execute({
      ...createReservationDto,
      check_in: new Date(createReservationDto.check_in),
      check_out: new Date(createReservationDto.check_out),
    });

    // Publish event for payment
    await this.rabbitMQService.sendToQueue('payment.required', {
      reservationId: reservation.id,
      amount: reservation.total_price,
      userId: reservation.user_id,
    });

    // Publish event for notification
    await this.rabbitMQService.sendToQueue('reservation.created', {
      reservationId: reservation.id,
      userId: reservation.user_id,
      hotelId: reservation.hotel_id,
    });

    return reservation;
  }

  async update(id: number, updateReservationDto: UpdateReservationDto) {
    const reservation = await this.updateReservationUseCase.execute(id, updateReservationDto);
    
    if (updateReservationDto.status === ReservationStatus.CONFIRMED) {
      await this.rabbitMQService.sendToQueue('reservation.confirmed', {
        reservationId: reservation.id,
        userId: reservation.user_id,
      });
    }

    return reservation;
  }

  async cancel(id: number) {
    await this.cancelReservationUseCase.execute(id);
    
    await this.rabbitMQService.sendToQueue('reservation.cancelled', {
      reservationId: id,
    });
  }
}
