import { IsNumber, IsNotEmpty, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  hotel_id: number;

  @IsNumber()
  @IsNotEmpty()
  room_id: number;

  @IsDateString()
  @IsNotEmpty()
  check_in: string;

  @IsDateString()
  @IsNotEmpty()
  check_out: string;

  @IsNumber()
  @IsOptional()
  guests?: number;

  @IsString()
  @IsOptional()
  special_requests?: string;
}
