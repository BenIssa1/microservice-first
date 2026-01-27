import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ description: 'Room type', example: 'Deluxe Suite' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @ApiProperty({ description: 'Room price per night', example: 150.00 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'Room availability', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  available?: boolean;
}
