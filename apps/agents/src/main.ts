import { createServer } from "node:http";
import { app } from "./module/app";
import 'dotenv/config'
// import { initializeSockets } from "./module/socket";
import { SocketServer } from "./classes/socket-server.js";

const port = process.env.PORT || 3333;
export const server = createServer(app);

// (async () => {
//   try {
//     const io = await initializeSockets(server)
//   } catch(error) {
//     console.log("Socket Initialization Error:", error)
//   }
// })()

const socketServer = new SocketServer(server);

socketServer.initialize();


server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);



