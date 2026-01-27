import { Notification } from '../entities/notification.entity';

export interface INotificationRepository {
  findAll(userId?: number): Promise<Notification[]>;
  findById(id: number): Promise<Notification | null>;
  create(notification: Partial<Notification>): Promise<Notification>;
  markAsRead(id: number): Promise<Notification>;
  markAllAsRead(userId: number): Promise<void>;
}
