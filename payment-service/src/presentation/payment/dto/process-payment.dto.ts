import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class ProcessPaymentDto {
  @IsString()
  @IsNotEmpty()
  payment_token: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
