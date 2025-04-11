import { Redis } from 'ioredis';
import 'dotenv/config';

class RedisPublisher {
  private static instance: RedisPublisher;
  private publisher: Redis;
  private isConnected: boolean = false;

  private constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error("REDIS_URL is not defined in environment variables");
    }

    this.publisher = new Redis(redisUrl);

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.publisher.on('error', (err) => {
      console.error('Redis Publisher Error:', err);
      this.isConnected = false;
    });

    this.publisher.on('connect', () => {
      console.log('Redis Publisher Connected');
      this.isConnected = true;
    });

    this.publisher.on('end', () => {
      console.log('Redis Publisher Connection Closed');
      this.isConnected = false;
    });
  }

  public static getInstance(): RedisPublisher {
    if (!RedisPublisher.instance) {
      RedisPublisher.instance = new RedisPublisher();
    }
    return RedisPublisher.instance;
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.publisher.quit();
      } catch (error) {
        console.error('Failed to disconnect from Redis:', error);
        throw error;
      }
    }
  }

  public async publish(channel: string, message: string): Promise<void> {
    try {
      await this.publisher.publish(channel, message);
    } catch (error) {
      console.error('Failed to publish message to Redis:', error);
      throw error;
    }
  }
}

export const redisPub = RedisPublisher.getInstance();
