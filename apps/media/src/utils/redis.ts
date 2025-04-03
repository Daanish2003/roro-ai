import { createClient, RedisClientType } from 'redis';
import "dotenv/config";
import { roomManager } from '../core/room/manager/room-manager.js';

class RedisSubscriber {
    private static instance: RedisSubscriber;
    private subscriber: RedisClientType;

    private constructor() {
        this.subscriber = createClient({ url: process.env.REDIS_URL });
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.subscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));
        this.subscriber.on('connect', () => console.log('Redis Subscriber Connected'));
    }

    public static getInstance(): RedisSubscriber {
        if (!RedisSubscriber.instance) {
            RedisSubscriber.instance = new RedisSubscriber();
        }
        return RedisSubscriber.instance;
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
            data.topic,
            data.prompt,
            data.userId
        )
      }
    }

    public async subscribe(channel: string): Promise<void> {
        await this.subscriber.subscribe(channel, (message) => {
            this.listener(message, channel)
        })
        };
    }


export const redisSub = RedisSubscriber.getInstance();
