import { createClient, RedisClientType } from "redis"
import { aiFeedbackGenerator } from "../services/ai-feeback-generator.js";

export class RedisSubscriber {
    private static instance: RedisSubscriber
    private client: RedisClientType;
    private isConnected = false;

    constructor() {
        const redisUrl = process.env.REDIS_URL;
        const username = process.env.REDIS_USER;
        const password = process.env.REDIS_PASSWORD;
        const port = process.env.REDIS_PORT

        if (!redisUrl || !username || !password || !port) {
            throw new Error('Redis environment variables are not properly set');
        }

        this.client = createClient({
            username,
            password,
            socket: {
                host: redisUrl,
                port: Number(port),
                tls: process.env.NODE_ENV === 'production' ? true : false,
            }
        });

        this.setupEventHandler()
    }

    public connect() {
        this.client.connect().catch(console.error);
    }

    private setupEventHandler(): void {
        this.client.on('error', (err) => {
            console.error('Redis Subscriber Error:', err);
            this.isConnected = false;
        })

        this.client.on('connect', () => {
            console.log('Redis Subscriber Connected');
            this.isConnected = true;
        })

        this.client.on('end', () => {
            console.log('Redis Subscriber Connection Closed');
            this.isConnected = false;
        });
    }

    public static getInstance(): RedisSubscriber {
        if(!RedisSubscriber.instance) {
            RedisSubscriber.instance = new RedisSubscriber()
        }

        return RedisSubscriber.instance
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

    private async listener(channel: string, message: string) {
        if(channel === 'CHAT_CLOSED') {
            try {
                console.log(`Received message on ${channel}:`, message);
                aiFeedbackGenerator(message)
            } catch (err) {
                console.error('Failed to get AI feedback:', err);
            }
        }
    }

    public async subscribe(channel: string) {
        try {
            await this.client.subscribe(channel, message => {
                this.listener(channel, message)
            })
        } catch (err) {
            console.log("Subscribe Error", err)
        }
    }
}

export const redisSub = RedisSubscriber.getInstance()