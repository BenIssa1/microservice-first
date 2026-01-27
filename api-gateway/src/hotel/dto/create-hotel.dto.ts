import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHotelDto {
  @ApiProperty({ description: 'Hotel name', example: 'Grand Hotel Paris' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'City where the hotel is located', example: 'Paris' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({ description: 'Hotel address', example: '123 Champs-Élysées' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;
}
