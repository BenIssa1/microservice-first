import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reservation } from '../../domain/entities/reservation.entity';
import { IReservationRepository } from '../../domain/repositories/reservation.repository.interface';

@Injectable()
export class ReservationRepository implements IReservationRepository {
  constructor(
    @InjectRepository(Reservation)
    private readonly repository: Repository<Reservation>,
  ) {}

  async findAll(userId?: number): Promise<Reservation[]> {
    const queryBuilder = this.repository.createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.dates', 'dates');

    if (userId) {
      queryBuilder.where('reservation.user_id = :userId', { userId });
    }

    return await queryBuilder.getMany();
  }

  async findById(id: number): Promise<Reservation | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['dates'],
    });
  }

  async create(reservation: Partial<Reservation>): Promise<Reservation> {
    const newReservation = this.repository.create(reservation);
    return await this.repository.save(newReservation);
  }

  async update(id: number, reservation: Partial<Reservation>): Promise<Reservation> {
    await this.repository.update(id, reservation);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findByRoomAndDates(roomId: number, checkIn: Date, checkOut: Date): Promise<Reservation[]> {
    return await this.repository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.dates', 'dates')
      .where('reservation.room_id = :roomId', { roomId })
      .andWhere('reservation.status != :status', { status: 'cancelled' })
      .andWhere(
        '(dates.check_in <= :checkOut AND dates.check_out >= :checkIn)',
        { checkIn, checkOut }
      )
      .getMany();
  }
}
