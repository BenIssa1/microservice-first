import { IsString, IsEmail, IsNotEmpty, IsOptional, MaxLength, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../domain/entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  first_name: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name: string;

  @ApiProperty({ description: 'User phone number', example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  phone?: string;

  @ApiProperty({ description: 'User password (optional - if provided, credentials will be created)', example: 'SecurePassword123!', minLength: 8, required: false })
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @ApiProperty({ description: 'User role', example: 'user', enum: UserRole, required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
