import { Injectable, Inject } from '@nestjs/common';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { Payment } from '../../../domain/entities/payment.entity';

@Injectable()
export class GetAllPaymentsUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(reservationId?: number): Promise<Payment[]> {
    return await this.paymentRepository.findAll(reservationId);
  }
}
