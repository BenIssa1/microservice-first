import { Injectable, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Channel } from 'amqplib';
import { NotificationType } from '../../domain/entities/notification.entity';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection!: Awaited<ReturnType<typeof connect>>;
  private channel!: Channel;
  private readonly url: string;
  private notificationRepository: INotificationRepository;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(
    private configService: ConfigService,
    @Inject('INotificationRepository') notificationRepository: INotificationRepository,
  ) {
    this.notificationRepository = notificationRepository;
    this.url = this.configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672';
  }

  async onModuleInit() {
    await this.initialize();
  }

  private async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        this.connection = await connect(this.url);
        this.channel = await this.connection.createChannel();
        await this.setupQueues();
        await this.setupConsumers();
        this.isInitialized = true;
        console.log('RabbitMQ connected successfully');
      } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        this.isInitialized = false;
        // Retry connection after 5 seconds
        setTimeout(() => this.initialize(), 5000);
      }
    })();

    return this.initializationPromise;
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
      // Wait a bit more to ensure channel is ready
      let retries = 10;
      while (!this.isInitialized && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries--;
      }
      if (!this.isInitialized) {
        throw new Error('RabbitMQ channel not initialized after retries');
      }
    }
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  private async setupQueues() {
    await this.channel.assertQueue('user.registered', { durable: true });
    await this.channel.assertQueue('reservation.created', { durable: true });
    await this.channel.assertQueue('reservation.confirmed', { durable: true });
    await this.channel.assertQueue('reservation.cancelled', { durable: true });
    await this.channel.assertQueue('payment.completed', { durable: true });
    await this.channel.assertQueue('payment.failed', { durable: true });
  }

  private async setupConsumers() {
    // Consumer for user registered
    await this.channel.consume('user.registered', async (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        console.log(`[NOTIFICATION SERVICE] User registered: ${content.email} (ID: ${content.userId})`);
        console.log(`[NOTIFICATION SERVICE] Welcome email should be sent to: ${content.email}`);
        // TODO: Implement email sending here
        // For now, create a notification record
        await this.notificationRepository.create({
          user_id: content.userId,
          type: NotificationType.USER_REGISTERED,
          message: `Welcome ${content.firstName} ${content.lastName}! Your account has been created successfully.`,
          metadata: { 
            userId: content.userId,
            email: content.email,
            firstName: content.firstName,
            lastName: content.lastName,
          },
          sent_at: new Date(),
        });
        this.channel.ack(msg);
      }
    });

    // Consumer for reservation created
    await this.channel.consume('reservation.created', async (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        await this.notificationRepository.create({
          user_id: content.userId,
          type: NotificationType.RESERVATION_CREATED,
          message: `Your reservation #${content.reservationId} has been created successfully.`,
          metadata: { reservationId: content.reservationId },
          sent_at: new Date(),
        });
        this.channel.ack(msg);
      }
    });

    // Consumer for reservation confirmed
    await this.channel.consume('reservation.confirmed', async (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        await this.notificationRepository.create({
          user_id: content.userId,
          type: NotificationType.RESERVATION_CONFIRMED,
          message: `Your reservation #${content.reservationId} has been confirmed.`,
          metadata: { reservationId: content.reservationId },
          sent_at: new Date(),
        });
        this.channel.ack(msg);
      }
    });

    // Consumer for reservation cancelled
    await this.channel.consume('reservation.cancelled', async (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        await this.notificationRepository.create({
          user_id: content.userId,
          type: NotificationType.RESERVATION_CANCELLED,
          message: `Your reservation #${content.reservationId} has been cancelled.`,
          metadata: { reservationId: content.reservationId },
          sent_at: new Date(),
        });
        this.channel.ack(msg);
      }
    });

    // Consumer for payment completed
    await this.channel.consume('payment.completed', async (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        await this.notificationRepository.create({
          user_id: content.userId,
          type: NotificationType.PAYMENT_COMPLETED,
          message: `Payment for reservation #${content.reservationId} has been completed successfully.`,
          metadata: { reservationId: content.reservationId, paymentId: content.paymentId },
          sent_at: new Date(),
        });
        this.channel.ack(msg);
      }
    });

    // Consumer for payment failed
    await this.channel.consume('payment.failed', async (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        await this.notificationRepository.create({
          user_id: content.userId,
          type: NotificationType.PAYMENT_FAILED,
          message: `Payment for reservation #${content.reservationId} has failed. Please try again.`,
          metadata: { reservationId: content.reservationId, paymentId: content.paymentId },
          sent_at: new Date(),
        });
        this.channel.ack(msg);
      }
    });
  }

  async publish(exchange: string, routingKey: string, message: any) {
    await this.ensureInitialized();
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    try {
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
    } catch (error) {
      console.error('Error publishing message:', error);
      throw error;
    }
  }

  async sendToQueue(queue: string, message: any) {
    await this.ensureInitialized();
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    try {
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
    } catch (error) {
      console.error('Error sending message to queue:', error);
      throw error;
    }
  }
}
