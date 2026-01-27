import { Injectable } from '@nestjs/common';
import { CreateNotificationUseCase } from '../../application/use-cases/notification/create-notification.use-case';
import { GetAllNotificationsUseCase } from '../../application/use-cases/notification/get-all-notifications.use-case';
import { GetNotificationByIdUseCase } from '../../application/use-cases/notification/get-notification-by-id.use-case';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationRepository } from '../../infrastructure/repositories/notification.repository';
import { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly getAllNotificationsUseCase: GetAllNotificationsUseCase,
    private readonly getNotificationByIdUseCase: GetNotificationByIdUseCase,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async findAll(userId?: number) {
    return await this.getAllNotificationsUseCase.execute(userId);
  }

  async findOne(id: number) {
    return await this.getNotificationByIdUseCase.execute(id);
  }

  async create(createNotificationDto: CreateNotificationDto) {
    return await this.createNotificationUseCase.execute({
      ...createNotificationDto,
      sent_at: new Date(),
    });
  }


  async markAsRead(id: number) {
    return await this.notificationRepository.markAsRead(id);
  }
}
