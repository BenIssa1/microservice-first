import { Injectable, Inject } from '@nestjs/common';
import { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';
import { Reservation } from '../../../domain/entities/reservation.entity';

@Injectable()
export class GetAllReservationsUseCase {
  constructor(
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(userId?: number): Promise<Reservation[]> {
    return await this.reservationRepository.findAll(userId);
  }
}
