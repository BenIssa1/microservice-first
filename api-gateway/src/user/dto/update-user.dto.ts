import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsOptional, IsDateString, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ description: 'User date of birth', example: '1990-01-01', required: false })
  @IsDateString()
  @IsOptional()
  date_of_birth?: string;

  @ApiProperty({ description: 'User address', example: '123 Main St', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @ApiProperty({ description: 'User city', example: 'Paris', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ description: 'Postal code', example: '75001', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  postal_code?: string;

  @ApiProperty({ description: 'Country', example: 'France', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ description: 'Avatar URL', example: 'https://example.com/avatar.jpg', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  avatar_url?: string;

  @ApiProperty({ description: 'Is user active', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
