import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity('reservation_dates')
export class ReservationDate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  reservation_id: number;

  @ManyToOne(() => Reservation, (reservation) => reservation.dates)
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @Column({ type: 'date' })
  check_in: Date;

  @Column({ type: 'date' })
  check_out: Date;

  @CreateDateColumn()
  created_at: Date;
}
