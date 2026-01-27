import { Reservation } from '../entities/reservation.entity';

export interface IReservationRepository {
  findAll(userId?: number): Promise<Reservation[]>;
  findById(id: number): Promise<Reservation | null>;
  create(reservation: Partial<Reservation>): Promise<Reservation>;
  update(id: number, reservation: Partial<Reservation>): Promise<Reservation>;
  delete(id: number): Promise<void>;
  findByRoomAndDates(roomId: number, checkIn: Date, checkOut: Date): Promise<Reservation[]>;
}
