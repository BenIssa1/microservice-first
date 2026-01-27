import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';
import { ReservationStatus } from '../../../domain/entities/reservation.entity';

@Injectable()
export class CancelReservationUseCase {
  constructor(
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('Reservation is already cancelled');
    }
    if (reservation.status === ReservationStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed reservation');
    }
    await this.reservationRepository.update(id, { status: ReservationStatus.CANCELLED });
  }
}
