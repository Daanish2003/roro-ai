import express, { Application } from 'express';
import cors from "cors"
import "dotenv/config.js"
import room_router from './routes/room.routes.js';
import feedback_router from './routes/feedback.routes.js';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './config/auth-config.js';

const app: Application = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    exposedHeaders: [
        'set-auth-token',

    ]
}))

app.all('/api/auth/*', toNodeHandler(auth.handler))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/rooms', room_router)
app.use('/api/v1/feedbacks', feedback_router)


export { app };
