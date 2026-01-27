import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repository: Repository<Payment>,
  ) {}

  async findAll(reservationId?: number): Promise<Payment[]> {
    const queryBuilder = this.repository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.transactions', 'transactions');

    if (reservationId) {
      queryBuilder.where('payment.reservation_id = :reservationId', { reservationId });
    }

    return await queryBuilder.getMany();
  }

  async findById(id: number): Promise<Payment | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['transactions'],
    });
  }

  async create(payment: Partial<Payment>): Promise<Payment> {
    const newPayment = this.repository.create(payment);
    return await this.repository.save(newPayment);
  }

  async update(id: number, payment: Partial<Payment>): Promise<Payment> {
    await this.repository.update(id, payment);
    return await this.findById(id);
  }
}
