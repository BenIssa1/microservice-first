import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { Payment } from '../../../domain/entities/payment.entity';

@Injectable()
export class GetPaymentByIdUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }
}
