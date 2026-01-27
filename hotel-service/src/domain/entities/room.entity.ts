import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Hotel } from './hotel.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  hotel_id: number;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms)
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'boolean', default: true })
  available: boolean;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image_url: string;

  @Column({ type: 'jsonb', nullable: true })
  amenities: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
