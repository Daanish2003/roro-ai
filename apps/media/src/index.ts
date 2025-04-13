import { createServer } from "node:http";
import { app } from "./module/app.js";
import 'dotenv/config'
import { mediasoupWorkerManager } from "./core/mediasoup/managers/media-worker-manager.js";
import { SocketManager} from "./core/socket/managers/socket-manager.js";
import { VAD } from "./core/vad/core/vad.js";
import { redisSub } from "./utils/redis.js";

const port = process.env.PORT || 3333;
export const server = createServer(app);

redisSub.connect()
redisSub.subscribe('createRoom')


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



