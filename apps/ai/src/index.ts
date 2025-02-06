import { createServer } from "node:http";
import { app } from "./module/app.js";
import 'dotenv/config'


const port = process.env.PORT || 3333;
export const server = createServer(app);

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);



