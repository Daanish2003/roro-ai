import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import express, { type Application } from 'express';
import { auth } from './auth';
import cors from "cors"

export const app:Application = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}))

app.all('/api/auth/*', toNodeHandler(auth.handler))

app.get('/api/get-session', async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  })

  return res.json(session);
})



