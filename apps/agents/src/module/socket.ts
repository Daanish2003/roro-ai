import type { Server as HttpServer} from "node:http";
import { Server } from "socket.io";


export const initializeSockets = async (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            credentials: true,
        }
    })

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("A user disconnected:", socket.id);
        });
    });

    return io


} 