import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentTransaction } from '../../domain/entities/payment-transaction.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { CreatePaymentUseCase } from '../../application/use-cases/payment/create-payment.use-case';
import { ProcessPaymentUseCase } from '../../application/use-cases/payment/process-payment.use-case';
import { GetAllPaymentsUseCase } from '../../application/use-cases/payment/get-all-payments.use-case';
import { GetPaymentByIdUseCase } from '../../application/use-cases/payment/get-payment-by-id.use-case';
import { RabbitMQModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, PaymentTransaction]), RabbitMQModule, AuthModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentRepository,
    {
      provide: 'IPaymentRepository',
      useClass: PaymentRepository,
    },
    CreatePaymentUseCase,
    ProcessPaymentUseCase,
    GetAllPaymentsUseCase,
    GetPaymentByIdUseCase,
  ],
})
export class PaymentModule {}
