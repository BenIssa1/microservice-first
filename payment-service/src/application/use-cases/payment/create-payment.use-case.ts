import { Injectable, Inject } from '@nestjs/common';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { Payment, PaymentMethod } from '../../../domain/entities/payment.entity';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(paymentData: {
    reservation_id: number;
    amount: number;
    method: PaymentMethod;
  }): Promise<Payment> {
    return await this.paymentRepository.create(paymentData);
  }
}
