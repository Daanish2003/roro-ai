/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { app } from "./modules/app"
import { createServer } from "node:http";
import "dotenv/config"

const port = process.env.PORT || 3333;

const server = createServer(app)

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);
