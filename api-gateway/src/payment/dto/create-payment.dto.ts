import { IsNumber, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Reservation ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  reservation_id: number;

  @ApiProperty({ description: 'Payment amount', example: 500.00 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ description: 'Payment method', example: 'credit_card', enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer'] })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  method: string;
}
