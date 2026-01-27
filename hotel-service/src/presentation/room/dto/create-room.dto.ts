import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, MaxLength, IsArray } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsBoolean()
  @IsOptional()
  available?: boolean;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsArray()
  @IsOptional()
  amenities?: string[];
}
