import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import express, { type Application } from 'express';
import { auth } from './auth';
import cors from "cors"
import { createRoomSchema } from '../zod/schema';
import { createRoom } from '../db/room-db';

export const app:Application = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}))

app.all('/api/auth/*', toNodeHandler(auth.handler))

app.use(express.json())

app.post('/api/create-room', async (req, res) => {
   const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
   })

   if(!session) {
      return res.status(401).json({ error: "Unauthorized "})
   }

   console.log(req.body)

   const validatedFields = createRoomSchema.safeParse(req.body)

   if(!validatedFields.success) {
      throw new Error("Invalid Fields")
   }

   const { userId, name } = validatedFields.data

   const roomId = await createRoom({userId, name})



   res.status(200).json({roomId})
})



