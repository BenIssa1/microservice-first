import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NotificationType {
  USER_REGISTERED = 'user_registered',
  RESERVATION_CREATED = 'reservation_created',
  RESERVATION_CONFIRMED = 'reservation_confirmed',
  RESERVATION_CANCELLED = 'reservation_cancelled',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = "payment_failed",
  REMINDER = 'reminder',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sent_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
