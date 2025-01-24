import { Server, type Socket } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { RoomManager } from "../managers/room-manager";

export class SocketServer {
    private io: Server;
    private roomManager: RoomManager; // Use RoomManager for centralized room management

    constructor(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST"],
            },
        });

        this.roomManager = new RoomManager();
    }

    public initialize(): Server {
        this.io.on("connection", (socket: Socket) => {
            console.log("Client connected:", socket.id);

            socket.on(
                "createRoom",
                (callback: (response: { roomId: string }) => void) => {
                    const roomId = this.roomManager.createRoom(); // Create room using RoomManager
                    callback({ roomId });
                }
            );

            socket.on(
                "joinRoom",
                ({ roomId }: { roomId: string }, callback: (response: { success: boolean }) => void) => {
                    const success = this.roomManager.joinRoom(roomId, socket.id); // Join room using RoomManager
                    callback({ success });
                }
            );

            socket.on("audioStream", ({ roomId, audio }: { roomId: string; audio: Buffer }) => {
                console.log(`Received audio from ${socket.id} in room ${roomId}`);
                const room = this.roomManager.getRoomById(roomId);
                if (room) {
                    room.handleAudioStream(socket.id, audio);
                }
            });

    
            socket.on("disconnect", () => {
                this.handleDisconnect(socket.id);
            });
        });

        return this.io;
    }

    // Handle peer disconnection from all rooms
    private handleDisconnect(peerId: string): void {
        const allRoomIds = this.roomManager.getAllRoomIds();
        for (const roomId of allRoomIds) {
            this.roomManager.removePeerFromRoom(roomId, peerId);
        }
    }

    // Close all rooms and the Socket.IO server
    public close(): void {
        this.io.close();
        const allRoomIds = this.roomManager.getAllRoomIds();
        for (const roomId of allRoomIds) {
            this.roomManager.closeRoom(roomId);
        }
    }
}
