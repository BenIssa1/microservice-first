import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { Payment, PaymentStatus } from '../../../domain/entities/payment.entity';
import { PaymentTransaction, TransactionType, TransactionStatus } from '../../../domain/entities/payment-transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
    @InjectRepository(PaymentTransaction)
    private readonly transactionRepository: Repository<PaymentTransaction>,
  ) {}

  async execute(paymentId: number, paymentToken: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in pending status');
    }

    // Update payment status to processing
    await this.paymentRepository.update(paymentId, {
      status: PaymentStatus.PROCESSING,
      payment_token: paymentToken,
    });

    try {
      // Simulate payment processing (in real scenario, integrate with payment gateway)
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create transaction record
      const transaction = this.transactionRepository.create({
        payment_id: paymentId,
        type: TransactionType.PAYMENT,
        status: TransactionStatus.SUCCESS,
        amount: payment.amount,
        external_transaction_id: transactionId,
      });
      await this.transactionRepository.save(transaction);

      // Update payment status to completed
      const updatedPayment = await this.paymentRepository.update(paymentId, {
        status: PaymentStatus.COMPLETED,
        transaction_id: transactionId,
      });

      return updatedPayment;
    } catch (error) {
      // Create failed transaction record
      const transaction = this.transactionRepository.create({
        payment_id: paymentId,
        type: TransactionType.PAYMENT,
        status: TransactionStatus.FAILED,
        amount: payment.amount,
        error_message: error.message,
      });
      await this.transactionRepository.save(transaction);

      // Update payment status to failed
      await this.paymentRepository.update(paymentId, {
        status: PaymentStatus.FAILED,
      });

      throw new BadRequestException('Payment processing failed');
    }
  }
}
