import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';
import { Reservation } from '../../../domain/entities/reservation.entity';

@Injectable()
export class UpdateReservationUseCase {
  constructor(
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(id: number, reservationData: Partial<Reservation>): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    return await this.reservationRepository.update(id, reservationData);
  }
}
