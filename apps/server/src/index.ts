import { createServer } from "node:http";
import "dotenv/config"
import { app } from "@roro-ai/api/app";

const port = process.env.PORT || 4000;

const server = createServer(app)


server.listen(port ,() => {
  console.log(`Listening at http://localhost:${port}`);
});

server.on('error', console.error);
