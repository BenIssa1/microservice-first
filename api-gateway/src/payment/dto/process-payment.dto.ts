import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessPaymentDto {
  @ApiProperty({ description: 'Payment token from payment gateway', example: 'tok_visa_1234567890' })
  @IsString()
  @IsNotEmpty()
  payment_token: string;

  @ApiProperty({ description: 'Additional payment metadata', example: {}, required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
