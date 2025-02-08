import { createClient, RedisClientType } from 'redis';
import "dotenv/config";

class RedisClient {
  private static instance: RedisClient;
  private publisher: RedisClientType;
  private subscriber: RedisClientType;
  private isPublisherConnected: boolean = false;
  private isSubscriberConnected: boolean = false;

  private constructor() {
    // Create the main client for publishing and regular commands
    this.publisher = createClient({
      url: process.env.REDIS_URL
    });
    // Duplicate the publisher to create a separate client for subscription
    
    this.subscriber = this.publisher.duplicate();

    this.setupEventHandlers(this.publisher, 'Publisher');
    this.setupEventHandlers(this.subscriber, 'Subscriber');
  }

  private setupEventHandlers(client: RedisClientType, clientName: string): void {
    client.on('error', (err) => {
      console.error(`${clientName} Redis Client Error:`, err);
      if (clientName === 'Publisher') {
        this.isPublisherConnected = false;
      } else {
        this.isSubscriberConnected = false;
      }
    });

    client.on('connect', () => {
      console.log(`${clientName} Redis Client Connected`);
      if (clientName === 'Publisher') {
        this.isPublisherConnected = true;
      } else {
        this.isSubscriberConnected = true;
      }
    });

    client.on('end', () => {
      console.log(`${clientName} Redis Client Connection Closed`);
      if (clientName === 'Publisher') {
        this.isPublisherConnected = false;
      } else {
        this.isSubscriberConnected = false;
      }
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  // Connect both publisher and subscriber clients
  public async connect(): Promise<void> {
    if (!this.isPublisherConnected) {
      try {
        await this.publisher.connect();
      } catch (error) {
        console.error('Failed to connect publisher to Redis:', error);
        throw error;
      }
    }
    if (!this.isSubscriberConnected) {
      try {
        await this.subscriber.connect();
      } catch (error) {
        console.error('Failed to connect subscriber to Redis:', error);
        throw error;
      }
    }
  }

  // Disconnect both clients
  public async disconnect(): Promise<void> {
    if (this.isPublisherConnected) {
      try {
        await this.publisher.disconnect();
      } catch (error) {
        console.error('Failed to disconnect publisher from Redis:', error);
        throw error;
      }
    }
    if (this.isSubscriberConnected) {
      try {
        await this.subscriber.disconnect();
      } catch (error) {
        console.error('Failed to disconnect subscriber from Redis:', error);
        throw error;
      }
    }
  }

  // Regular key/value operations use the publisher client
  public async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.publisher.set(key, value, { EX: ttl });
      } else {
        await this.publisher.set(key, value);
      }
    } catch (error) {
      console.error('Failed to set Redis key:', error);
      throw error;
    }
  }

  public async get(key: string): Promise<string | null> {
    try {
      return await this.publisher.get(key);
    } catch (error) {
      console.error('Failed to get Redis key:', error);
      throw error;
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.publisher.del(key);
    } catch (error) {
      console.error('Failed to delete Redis key:', error);
      throw error;
    }
  }

  // Publish a message to a channel
  public async publish(channel: string, message: string): Promise<number> {
    try {
      return await this.publisher.publish(channel, message);
    } catch (error) {
      console.error(`Failed to publish message to channel ${channel}:`, error);
      throw error;
    }
  }

  // Subscribe to a channel with a provided message listener callback
  public async subscribe(channel: string, listener: (message: string) => void): Promise<void> {
    try {
      await this.subscriber.subscribe(channel, (message) => {
        listener(message);
      });
      console.log(`Subscribed to channel: ${channel}`);
    } catch (error) {
      console.error(`Failed to subscribe to channel ${channel}:`, error);
      throw error;
    }
  }

  // Unsubscribe from a channel
  public async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(channel);
      console.log(`Unsubscribed from channel: ${channel}`);
    } catch (error) {
      console.error(`Failed to unsubscribe from channel ${channel}:`, error);
      throw error;
    }
  }
}

export const redis = RedisClient.getInstance();
