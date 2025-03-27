import { createServer } from "node:http";
import { app } from "./module/app.js";
import 'dotenv/config'
import { mediasoupWorkerManager } from "./core/mediasoup/managers/media-worker-manager.js";
import { redis } from "@roro-ai/database/client";
import { redisSub } from "./utils/redis.js";
import { SocketManager} from "./core/socket/managers/socket-manager.js";
import { VAD } from "./core/vad/core/vad.js";


const port = process.env.PORT || 3333;
export const server = createServer(app);

const initRedis = async () => {
  try {
      await redis.connect();
      await redisSub.connect();
      await redisSub.subscribe("createRoom");
  } catch (error) {
      console.error('Failed to initialize Redis:', error);
      process.exit(1);
  }
};

initRedis();

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



