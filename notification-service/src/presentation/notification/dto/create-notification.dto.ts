import { IsNumber, IsNotEmpty, IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { NotificationType } from '../../../domain/entities/notification.entity';

export class CreateNotificationDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
