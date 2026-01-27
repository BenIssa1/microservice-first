import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Payment } from './payment.entity';

export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
}

export enum TransactionStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('payment_transactions')
export class PaymentTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  payment_id: number;

  @ManyToOne(() => Payment, (payment) => payment.transactions)
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  external_transaction_id: string;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
