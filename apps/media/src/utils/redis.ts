import { createClient, RedisClientType } from 'redis';
import "dotenv/config";
import { roomManager } from '../managers/room-manager.js';

class RedisClient {
    private static instance: RedisClient;
    private subscriber: RedisClientType;

    private constructor() {
        this.subscriber = createClient({ url: process.env.REDIS_URL });
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.subscriber.on('error', (err) => console.error('Redis Error:', err));
        this.subscriber.on('connect', () => console.log('Media Redis Connected'));
    }

    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    public async connect(): Promise<void> {
        await this.subscriber.connect();
    }

    private async listener(message: string, channel: string) {
      if(channel === "createRoom") {
        const data = JSON.parse(message)
        console.log(data)
        await roomManager.createRoom(
            data.id,
            data.prompt,
            data.topic
        )
      }
    }

    public async subscribe(channel: string): Promise<void> {
        await this.subscriber.subscribe(channel, (message) => this.listener(message, channel))
        };
    }


export const redis = RedisClient.getInstance();
