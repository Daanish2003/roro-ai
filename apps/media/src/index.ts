import { createServer } from "node:http";
import { app } from "./module/app.js";
import 'dotenv/config'
import { socketServer } from "./classes/socket-server.js";
import { mediasoupWorkerManager } from "./managers/worker-manager.js";


const port = process.env.PORT || 3333;
export const server = createServer(app);

(async() => {
  try {
    socketServer.initialize();
    await mediasoupWorkerManager.createWorkers();
  } catch (error) {
    console.error("Error during initialization:", error);
  }
})()

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);



