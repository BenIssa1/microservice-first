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
    // Start initialization in background, don't block module init
    this.initialize().catch((error) => {
      console.error('[AUTH SERVICE] Initial RabbitMQ connection attempt failed, will retry:', error.message);
    });
  }

  private async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      let retries = 10;
      let lastError: any;
      
      while (retries > 0) {
        try {
          console.log(`[AUTH SERVICE] Attempting to connect to RabbitMQ (${11 - retries}/10)...`);
          this.connection = await connect(this.url);
          this.channel = await this.connection.createChannel();
          await this.setupQueues();
          this.isInitialized = true;
          console.log('[AUTH SERVICE] RabbitMQ connected successfully');
          return;
        } catch (error) {
          lastError = error;
          retries--;
          if (retries > 0) {
            console.log(`[AUTH SERVICE] Failed to connect to RabbitMQ, retrying in 3 seconds... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      }
      
      // If all retries failed, log error but don't throw
      console.error('[AUTH SERVICE] Failed to connect to RabbitMQ after 10 attempts:', lastError?.message || lastError);
      this.isInitialized = false;
      // Continue retrying in background
      setTimeout(() => {
        this.initializationPromise = null;
        this.initialize();
      }, 10000);
    })();

    return this.initializationPromise;
  }

  private async ensureInitialized() {
    if (this.isInitialized && this.channel) {
      return; // Already initialized
    }

    // If initialization is in progress, wait for it (with longer timeout)
    if (this.initializationPromise) {
      try {
        await Promise.race([
          this.initializationPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Initialization promise timeout')), 35000)
          ),
        ]);
      } catch (error) {
        // If promise times out, start a new initialization
        this.initializationPromise = null;
        await this.initialize();
      }
    } else {
      // Otherwise start initialization
      await this.initialize();
    }
    
    // Wait a bit more to ensure channel is ready
    let retries = 50; // Increased retries (10 seconds total)
    while ((!this.isInitialized || !this.channel) && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 200));
      retries--;
    }
    
    if (!this.isInitialized || !this.channel) {
      throw new Error('RabbitMQ channel not initialized after retries');
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
  }

  async sendToQueue(queue: string, message: any): Promise<void> {
    // If already initialized, send immediately
    if (this.isInitialized && this.channel) {
      try {
        await this.channel.assertQueue(queue, { durable: true });
        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
          persistent: true,
        });
        console.log(`[AUTH SERVICE] Message sent to queue ${queue}:`, message);
        return;
      } catch (error) {
        console.error(`[AUTH SERVICE] Error sending message to queue ${queue}:`, error.message || error);
        // Reset initialization state to retry
        this.isInitialized = false;
        return; // Don't throw
      }
    }

    // If not initialized, try to initialize with longer timeout
    // Give RabbitMQ more time to be ready (up to 10 seconds)
    try {
      await Promise.race([
        this.ensureInitialized(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Initialization timeout after 10 seconds')), 10000)
        ),
      ]);

      // If we get here, initialization succeeded
      if (this.channel) {
        await this.channel.assertQueue(queue, { durable: true });
        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
          persistent: true,
        });
        console.log(`[AUTH SERVICE] Message sent to queue ${queue}:`, message);
      }
    } catch (error) {
      // If initialization fails or times out, just log and continue
      // This is expected if RabbitMQ is not yet ready
      console.warn(`[AUTH SERVICE] RabbitMQ not ready, skipping notification for queue ${queue}. Error: ${error.message || error}`);
      // Continue trying to initialize in background for future messages
      if (!this.initializationPromise) {
        this.initialize().catch(() => {
          // Ignore errors, will retry later
        });
      }
    }
  }
}
