import { IsNumber, IsNotEmpty, IsEnum } from 'class-validator';
import { PaymentMethod } from '../../../domain/entities/payment.entity';

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  reservation_id: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;
}
