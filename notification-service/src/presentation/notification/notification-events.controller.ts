import { Controller, Inject } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { NotificationType } from '../../domain/entities/notification.entity';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';

@Controller()
export class NotificationEventsController {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  @EventPattern('user.registered')
  async handleUserRegistered(payload: {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    console.log(`[NOTIFICATION SERVICE] User registered: ${payload.email} (ID: ${payload.userId})`);
    await this.notificationRepository.create({
      user_id: payload.userId,
      type: NotificationType.USER_REGISTERED,
      message: `Welcome ${payload.firstName} ${payload.lastName}! Your account has been created successfully.`,
      metadata: {
        userId: payload.userId,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
      },
      sent_at: new Date(),
    });
  }

  @EventPattern('reservation.created')
  async handleReservationCreated(payload: { reservationId: number; userId: number; hotelId: number }) {
    await this.notificationRepository.create({
      user_id: payload.userId,
      type: NotificationType.RESERVATION_CREATED,
      message: `Your reservation #${payload.reservationId} has been created successfully.`,
      metadata: { reservationId: payload.reservationId },
      sent_at: new Date(),
    });
  }

  @EventPattern('reservation.confirmed')
  async handleReservationConfirmed(payload: { reservationId: number; userId: number }) {
    await this.notificationRepository.create({
      user_id: payload.userId,
      type: NotificationType.RESERVATION_CONFIRMED,
      message: `Your reservation #${payload.reservationId} has been confirmed.`,
      metadata: { reservationId: payload.reservationId },
      sent_at: new Date(),
    });
  }

  @EventPattern('reservation.cancelled')
  async handleReservationCancelled(payload: { reservationId: number; userId?: number }) {
    await this.notificationRepository.create({
      user_id: payload.userId ?? 0,
      type: NotificationType.RESERVATION_CANCELLED,
      message: `Your reservation #${payload.reservationId} has been cancelled.`,
      metadata: { reservationId: payload.reservationId },
      sent_at: new Date(),
    });
  }

  @EventPattern('payment.completed')
  async handlePaymentCompleted(payload: {
    paymentId: number;
    reservationId: number;
    amount: number;
    userId?: number;
  }) {
    await this.notificationRepository.create({
      user_id: payload.userId ?? 0,
      type: NotificationType.PAYMENT_COMPLETED,
      message: `Payment for reservation #${payload.reservationId} has been completed successfully.`,
      metadata: { reservationId: payload.reservationId, paymentId: payload.paymentId },
      sent_at: new Date(),
    });
  }

  @EventPattern('payment.failed')
  async handlePaymentFailed(payload: {
    paymentId: number;
    reservationId: number;
    amount?: number;
    userId?: number;
  }) {
    await this.notificationRepository.create({
      user_id: payload.userId ?? 0,
      type: NotificationType.PAYMENT_FAILED,
      message: `Payment for reservation #${payload.reservationId} has failed. Please try again.`,
      metadata: { reservationId: payload.reservationId, paymentId: payload.paymentId },
      sent_at: new Date(),
    });
  }
}
