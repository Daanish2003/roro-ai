import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './config/auth-config.js';
import cors from "cors"
import "dotenv/config.js"
import room_router from './routes/room.routes.js';
import { redis } from "@roro-ai/database/client"

const app = express();

const initRedis = async () => {
    try {
        
        await redis.connect();
    } catch (error) {
        console.error('Failed to initialize Redis:', error);
        process.exit(1);
    }
};

initRedis();

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))

app.all('/api/auth/*', toNodeHandler(auth.handler))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/rooms', room_router)


// Export the app instance for usage in other packages
export { app };
