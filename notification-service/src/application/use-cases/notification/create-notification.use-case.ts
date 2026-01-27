import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../../domain/repositories/notification.repository.interface';
import { Notification } from '../../../domain/entities/notification.entity';

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(notificationData: Partial<Notification>): Promise<Notification> {
    return await this.notificationRepository.create(notificationData);
  }
}
