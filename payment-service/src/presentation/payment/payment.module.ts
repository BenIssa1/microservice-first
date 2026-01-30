import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentTransaction } from '../../domain/entities/payment-transaction.entity';
import { PaymentController } from './payment.controller';
import { PaymentEventsController } from './payment-events.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { CreatePaymentUseCase } from '../../application/use-cases/payment/create-payment.use-case';
import { ProcessPaymentUseCase } from '../../application/use-cases/payment/process-payment.use-case';
import { GetAllPaymentsUseCase } from '../../application/use-cases/payment/get-all-payments.use-case';
import { GetPaymentByIdUseCase } from '../../application/use-cases/payment/get-payment-by-id.use-case';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, PaymentTransaction]),
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672'],
            queue: 'notification_queue',
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    AuthModule,
  ],
  controllers: [PaymentController, PaymentEventsController],
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
