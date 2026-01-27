import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../domain/entities/notification.entity';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  async findAll(userId?: number): Promise<Notification[]> {
    const queryBuilder = this.repository.createQueryBuilder('notification')
      .orderBy('notification.sent_at', 'DESC');

    if (userId) {
      queryBuilder.where('notification.user_id = :userId', { userId });
    }

    return await queryBuilder.getMany();
  }

  async findById(id: number): Promise<Notification | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async create(notification: Partial<Notification>): Promise<Notification> {
    const newNotification = this.repository.create(notification);
    return await this.repository.save(newNotification);
  }

  async markAsRead(id: number): Promise<Notification> {
    await this.repository.update(id, { read: true });
    return await this.findById(id);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.repository.update({ user_id: userId, read: false }, { read: true });
  }
}
