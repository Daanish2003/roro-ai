import { createServer } from "node:http";
import "dotenv/config"
import { app } from "@roro-ai/api/app";

const port = process.env.PORT || 3333;

const server = createServer(app)

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);
