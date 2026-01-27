import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Room } from './room.entity';

@Entity('hotels')
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  rating: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image_url: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => Room, (room) => room.hotel)
  rooms: Room[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
