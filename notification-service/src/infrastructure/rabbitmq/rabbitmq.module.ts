import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQService } from './rabbitmq.service';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationRepository } from '../repositories/notification.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [
    RabbitMQService,
    NotificationRepository,
    {
      provide: 'INotificationRepository',
      useClass: NotificationRepository,
    },
  ],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
