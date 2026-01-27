import { PartialType } from '@nestjs/mapped-types';
import { CreateReservationDto } from './create-reservation.dto';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ReservationStatus } from '../../../domain/entities/reservation.entity';

export class UpdateReservationDto extends PartialType(CreateReservationDto) {
  @IsEnum(ReservationStatus)
  @IsOptional()
  status?: ReservationStatus;
}
