import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Channel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection!: Awaited<ReturnType<typeof connect>>;
  private channel!: Channel;
  private readonly url: string;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(private configService: ConfigService) {
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
    await this.channel.assertQueue('reservation.created', { durable: true });
    await this.channel.assertQueue('reservation.confirmed', { durable: true });
    await this.channel.assertQueue('reservation.cancelled', { durable: true });
    await this.channel.assertQueue('payment.required', { durable: true });
  }

  private async setupConsumers() {
    // Consumer for payment confirmation
    await this.channel.consume('payment.completed', async (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        console.log('Payment completed for reservation:', content.reservationId);
        // Update reservation status to confirmed
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
