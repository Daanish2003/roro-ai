import { Redis } from 'ioredis';
import 'dotenv/config';


class RedisClient {
  private static instance: RedisClient;
  private client: Redis;
  private isConnected: boolean = false;
  private constructor() {
    const redisUrl = process.env.REDIS_URL;
    const username = process.env.REDIS_USER;
    const password = process.env.REDIS_PASSWORD;
    const port = process.env.REDIS_PORT

    if (!redisUrl || !username || !password || !port) {
      throw new Error('REDIS_URL is not defined');
    }
    this.client = new Redis({
      username,
      password,
      host: redisUrl,
      port: Number(port),
      tls: {},
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
    });
    this.setupEventHandlers();
  }
  private setupEventHandlers(): void {
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });
    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.isConnected = true;
    });
    this.client.on('end', () => {
      console.log('Redis Client Connection Closed');
      this.isConnected = false;
    });
  }
  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }
  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.quit();
      } catch (error) {
        console.error('Failed to disconnect from Redis:', error);
        throw error;
      }
    }
  }
  public async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.set(key, value, 'EX', ttl);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error('Failed to set Redis key:', error);
      throw error;
    }
  }
  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Failed to get Redis key:', error);
      throw error;
    }
  }
  public async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Failed to delete Redis key:', error);
      throw error;
    }
  }

  public async publish(channel: string, message: string): Promise<void> {
    try {
      await this.client.publish(channel, message);
    } catch (error) {
      console.error('Failed to publish message to Redis:', error);
      throw error;
    }
  }

  public getClient(): Redis {
    return this.client;
  }
}
export const redis = RedisClient.getInstance();