import { createServer } from "node:http";
import { app } from "./module/app";
import 'dotenv/config'
import { initializeSockets } from "./module/socket";

const port = process.env.PORT || 3333;
export const server = createServer(app);

(async () => {
  try {
    const io = await initiaalizeSockets(server)
  } catch(error) {
    console.log("Socket Initialization Error:", error)
  }
})()

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);



