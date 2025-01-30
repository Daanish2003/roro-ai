import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './config/auth-config.js';
import cors from "cors"
import "dotenv/config.js"

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))

app.all('/api/auth/*', toNodeHandler(auth.handler))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Export the app instance for usage in other packages
export { app };
