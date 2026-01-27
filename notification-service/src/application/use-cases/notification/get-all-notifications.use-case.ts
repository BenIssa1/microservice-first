import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../../domain/repositories/notification.repository.interface';
import { Notification } from '../../../domain/entities/notification.entity';

@Injectable()
export class GetAllNotificationsUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(userId?: number): Promise<Notification[]> {
    return await this.notificationRepository.findAll(userId);
  }
}
