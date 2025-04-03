import { createClient, RedisClientType } from 'redis';
import "dotenv/config"

class RedisPublisher {
    private static instance: RedisPublisher;
    private publisher: RedisClientType;
    private isConnected: boolean = false;

    private constructor() {
        this.publisher = createClient({
            url: process.env.REDIS_URL
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.publisher.on('error', (err) => {
            console.error('Redis Client Error:', err);
            this.isConnected = false;
        });

        this.publisher.on('connect', () => {
            console.log('Redis Client Connected');
            this.isConnected = true;
        });

        this.publisher.on('end', () => {
            console.log('Redis Client Connection Closed');
            this.isConnected = false;
        });
    }

    public static getInstance(): RedisPublisher {
        if (!RedisPublisher.instance) {
            RedisPublisher.instance = new RedisPublisher();
        }
        return RedisPublisher.instance;
    }

    public async connect(): Promise<void> {
        if (!this.isConnected) {
            try {
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
        } catch (error) {
            console.error('Failed to publish message to Redis:', error);
            throw error;
        }

    }
}

export const redisPub = RedisPublisher.getInstance();