import { PartialType } from '@nestjs/mapped-types';
import { CreateReservationDto } from './create-reservation.dto';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReservationDto extends PartialType(CreateReservationDto) {
  @ApiProperty({ description: 'Reservation status', example: 'confirmed', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}
