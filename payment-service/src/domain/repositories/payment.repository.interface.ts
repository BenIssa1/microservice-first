import { Payment } from '../entities/payment.entity';

export interface IPaymentRepository {
  findAll(reservationId?: number): Promise<Payment[]>;
  findById(id: number): Promise<Payment | null>;
  create(payment: Partial<Payment>): Promise<Payment>;
  update(id: number, payment: Partial<Payment>): Promise<Payment>;
}
