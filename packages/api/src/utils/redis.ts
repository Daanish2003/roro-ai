import { createClient, RedisClientType } from 'redis';
import "dotenv/config"

class RedisClient {
    private static instance: RedisClient;
    private client: RedisClientType;
    private publisher: RedisClientType;
    private isConnected: boolean = false;

    private constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL
        });

        this.publisher = this.client.duplicate()

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

    public async connect(): Promise<void> {
        if (!this.isConnected) {
            try {
                await this.client.connect();
                await this.publisher.connect()
            } catch (error) {
                console.error('Failed to connect to Redis:', error);
                throw error;
            }
        }
    }

    public async disconnect(): Promise<void> {
        if (this.isConnected) {
            try {
                await this.client.disconnect();
                await this.publisher.disconnect()
            } catch (error) {
                console.error('Failed to disconnect from Redis:', error);
                throw error;
            }
        }
    }

    public async publish(channel: string, message: string)  {
        try {
            await this.publisher.publish(channel, message)
            console.log(`Published to ${channel}:`, message);
        } catch (error) {
            console.error('Failed to publish message to Redis:', error);
            throw error;
        }

    }

    public async set(key: string, value: string, ttl?: number): Promise<void> {
        try {
            if (ttl) {
                await this.client.set(key, value, { EX: ttl });
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

    public getClient(): RedisClientType {
        return this.client;
    }
}

export const redis = RedisClient.getInstance();