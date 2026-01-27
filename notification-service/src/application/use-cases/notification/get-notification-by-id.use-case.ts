import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INotificationRepository } from '../../../domain/repositories/notification.repository.interface';
import { Notification } from '../../../domain/entities/notification.entity';

@Injectable()
export class GetNotificationByIdUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }
}
