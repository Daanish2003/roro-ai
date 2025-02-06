import express, {type Application } from "express"
import cors from "cors"

export const app: Application = express();

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET" , "POST", "DELETE", "PUT"],
    credentials: true,
}))

app.use(express.json())




