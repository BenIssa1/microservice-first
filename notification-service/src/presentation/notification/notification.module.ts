import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from '../../infrastructure/repositories/notification.repository';
import { CreateNotificationUseCase } from '../../application/use-cases/notification/create-notification.use-case';
import { GetAllNotificationsUseCase } from '../../application/use-cases/notification/get-all-notifications.use-case';
import { GetNotificationByIdUseCase } from '../../application/use-cases/notification/get-notification-by-id.use-case';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), AuthModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    {
      provide: 'INotificationRepository',
      useClass: NotificationRepository,
    },
    CreateNotificationUseCase,
    GetAllNotificationsUseCase,
    GetNotificationByIdUseCase,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
