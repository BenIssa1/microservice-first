import { IsNumber, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({ description: 'User ID making the reservation', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ description: 'Hotel ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  hotel_id: number;

  @ApiProperty({ description: 'Room ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  room_id: number;

  @ApiProperty({ description: 'Check-in date (ISO 8601 format)', example: '2026-02-01' })
  @IsDateString()
  @IsNotEmpty()
  check_in: string;

  @ApiProperty({ description: 'Check-out date (ISO 8601 format)', example: '2026-02-05' })
  @IsDateString()
  @IsNotEmpty()
  check_out: string;
}
