import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';
import { Reservation, ReservationStatus } from '../../../domain/entities/reservation.entity';
import { ReservationDate } from '../../../domain/entities/reservation-date.entity';
import { HotelServiceClient } from '../../../infrastructure/clients/hotel-service.client';

@Injectable()
export class CreateReservationUseCase {
  constructor(
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
    private readonly hotelServiceClient: HotelServiceClient,
  ) {}

  async execute(reservationData: {
    user_id: number;
    hotel_id: number;
    room_id: number;
    check_in: Date;
    check_out: Date;
    guests?: number;
    special_requests?: string;
  }): Promise<Reservation> {
    // Check room availability
    const room = await this.hotelServiceClient.getRoom(reservationData.room_id);
    if (!room || !room.available) {
      throw new BadRequestException('Room is not available');
    }

    // Check for overlapping reservations
    const overlappingReservations = await this.reservationRepository.findByRoomAndDates(
      reservationData.room_id,
      reservationData.check_in,
      reservationData.check_out,
    );

    if (overlappingReservations.length > 0) {
      throw new BadRequestException('Room is already reserved for these dates');
    }

    // Calculate total price
    const days = Math.ceil(
      (reservationData.check_out.getTime() - reservationData.check_in.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = room.price * days;

    // Create reservation
    const reservation = await this.reservationRepository.create({
      user_id: reservationData.user_id,
      hotel_id: reservationData.hotel_id,
      room_id: reservationData.room_id,
      status: ReservationStatus.PENDING,
      total_price: totalPrice,
      guests: reservationData.guests,
      special_requests: reservationData.special_requests,
      dates: [
        {
          check_in: reservationData.check_in,
          check_out: reservationData.check_out,
        } as ReservationDate,
      ],
    });

    return reservation;
  }
}
