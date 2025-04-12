import { createServer } from "node:http";
import "dotenv/config"
import { app } from "@roro-ai/api/app";

const port = process.env.PORT || 4000;

const server = createServer(app)


server.listen({
  host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost',
  port: port
}, () => {
  console.log(`Listening at http://localhost:${port}`);
  console.log(`Listening at http://0.0.0.0:${port}`);
  console.log(process.env.FRONTEND_URL)
});

server.on('error', console.error);
