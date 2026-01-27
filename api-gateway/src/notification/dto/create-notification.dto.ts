import { IsNumber, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID to notify', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ description: 'Notification type', example: 'RESERVATION_CREATED' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  type: string;

  @ApiProperty({ description: 'Notification message', example: 'Your reservation has been confirmed' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
