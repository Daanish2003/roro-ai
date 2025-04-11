import { Redis } from 'ioredis';
import 'dotenv/config';
import { roomManager } from '../core/room/manager/room-manager.js';

class RedisSubscriber {
  private static instance: RedisSubscriber;
  private subscriber: Redis;

  private constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error("REDIS_URL is not defined in environment variables");
    }

    this.subscriber = new Redis(redisUrl);

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.subscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));
    this.subscriber.on('connect', () => console.log('Redis Subscriber Connected'));
    this.subscriber.on('message', (channel, message) => {
      this.listener(message, channel);
    });
  }

  public static getInstance(): RedisSubscriber {
    if (!RedisSubscriber.instance) {
      RedisSubscriber.instance = new RedisSubscriber();
    }
    return RedisSubscriber.instance;
  }

  private async listener(message: string, channel: string) {
    if (channel === 'createRoom') {
      try {
        const data = JSON.parse(message);
        await roomManager.createRoom(
          data.id,
          data.topic,
          data.prompt,
          data.userId
        );
      } catch (err) {
        console.error('Failed to handle createRoom message:', err);
      }
    }
  }

  public async subscribe(channel: string): Promise<void> {
    await this.subscriber.subscribe(channel);
  }
}

export const redisSub = RedisSubscriber.getInstance();
