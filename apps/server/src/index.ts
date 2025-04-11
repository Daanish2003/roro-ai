import { createServer } from "node:http";
import "dotenv/config"
import { app } from "@roro-ai/api/app";
import { redisPub } from '@roro-ai/api/utils';

const port = process.env.PORT || 3333;

redisPub.publish("server-started", "✅ Redis connection test successful")
  .then(() => console.log("Published Redis healthcheck"))
  .catch(console.error);

const server = createServer(app)

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);
