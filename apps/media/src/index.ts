import { createServer } from "node:http";
import { app } from "./module/app.js";
import 'dotenv/config'
import { SocketServer } from "./classes/socket-server.js";

const port = process.env.PORT || 3333;
export const server = createServer(app);

const socketServer = new SocketServer(server);
socketServer.initialize();

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);



