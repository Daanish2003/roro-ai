import { createServer } from "node:http";
import { app } from "./module/app.js";
import 'dotenv/config'
import { mediasoupWorkerManager } from "./core/mediasoup/managers/media-worker-manager.js";
import { SocketManager} from "./core/socket/managers/socket-manager.js";
import { VAD } from "./core/vad/core/vad.js";
import { Redis } from "ioredis"
import { roomManager } from "./core/room/manager/room-manager.js";

const port = process.env.PORT || 3333;
export const server = createServer(app);

const redis = new Redis(process.env.REDIS_URL!)

redis.subscribe('createRoom', (error) => {
  console.log("Redis Subscriber Create Room Error:", error)
})

redis.on('message', async (channel, message) => {
  if (channel === 'createRoom') {
    try {
      const data = JSON.parse(message);
      await roomManager.createRoom(
        data.id,
        data.topic,
        data.prompt,
        data.userId
      );
    } catch (err) {
      console.error('Failed to handle createRoom message:', err);
    }
  }
})

export const vad = (await VAD.load());

(async () => {
  try {
    SocketManager.getInstance()
    mediasoupWorkerManager.createWorkers();
  } catch (error) {
    console.error("Error during initialization:", error);
  }
})()

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);



