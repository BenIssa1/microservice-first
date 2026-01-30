import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreatePaymentUseCase } from '../../application/use-cases/payment/create-payment.use-case';
import { ProcessPaymentUseCase } from '../../application/use-cases/payment/process-payment.use-case';
import { GetAllPaymentsUseCase } from '../../application/use-cases/payment/get-all-payments.use-case';
import { GetPaymentByIdUseCase } from '../../application/use-cases/payment/get-payment-by-id.use-case';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PaymentStatus } from '../../domain/entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly getAllPaymentsUseCase: GetAllPaymentsUseCase,
    private readonly getPaymentByIdUseCase: GetPaymentByIdUseCase,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
  ) {}

  async findAll(reservationId?: number) {
    return await this.getAllPaymentsUseCase.execute(reservationId);
  }

  async findOne(id: number) {
    return await this.getPaymentByIdUseCase.execute(id);
  }

  async create(createPaymentDto: CreatePaymentDto) {
    return await this.createPaymentUseCase.execute(createPaymentDto);
  }

  async process(id: number, processPaymentDto: ProcessPaymentDto) {
    const payment = await this.processPaymentUseCase.execute(id, processPaymentDto.payment_token);
    
    if (payment.status === PaymentStatus.COMPLETED) {
      this.notificationClient.emit('payment.completed', {
        paymentId: payment.id,
        reservationId: payment.reservation_id,
        amount: payment.amount,
      }).subscribe();
    } else if (payment.status === PaymentStatus.FAILED) {
      this.notificationClient.emit('payment.failed', {
        paymentId: payment.id,
        reservationId: payment.reservation_id,
      }).subscribe();
    }

    return payment;
  }
}
