import { createServer } from "node:http";
import { app } from "./module/app.js";
import 'dotenv/config'
import { mediasoupWorkerManager } from "./managers/worker-manager.js";
import { SocketServer } from "./classes/socket-server.js";
import { redis } from "./utils/redis.js";


const port = process.env.PORT || 3333;
export const server = createServer(app);

const initRedis = async () => {
  try {
      await redis.connect();
      await redis.subscribe("createRoom");
  } catch (error) {
      console.error('Failed to initialize Redis:', error);
      process.exit(1);
  }
};

initRedis();

(async () => {
  try {
    const socketServer = SocketServer.getInstance()
    socketServer.initialize();
    mediasoupWorkerManager.createWorkers();
  } catch (error) {
    console.error("Error during initialization:", error);
  }
})()

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);



