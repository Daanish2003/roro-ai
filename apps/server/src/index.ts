import { createServer } from "node:http";
import "dotenv/config"
import { app } from "./api/index.js"
import { redisSub } from "./api/utils/redis.js";

const port = process.env.PORT || 4000;

const server = createServer(app)

redisSub.connect()
redisSub.subscribe('CHAT_CLOSED')


server.listen(port ,() => {
  console.log(`Listening at http://localhost:${port}`);
});

server.on('error', console.error);