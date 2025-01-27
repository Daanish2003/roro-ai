import { Server, type Socket } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { RoomManager } from "../managers/room-manager";
import type { RtpCapabilities } from "mediasoup/node/lib/rtpParametersTypes";

export class SocketServer {
    private io: Server;
    private roomManager: RoomManager;

    constructor(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true,
                allowedHeaders: ['content-Type']
            },
        });

        this.roomManager = new RoomManager();
    }

    public initialize(): Server {
        this.io.on("connection", (socket: Socket) => {
            console.log("Client connected:", socket.id);

            socket.on(
                "joinRoom",
                async ({ roomId }: { roomId: string }, callback: (response: { success: boolean ; routerRtpCap: RtpCapabilities} | {success: boolean}) => void) => {
                    console.log("Received the Join Room Event");
                    try {
                        const response = await this.roomManager.joinRoom(roomId, socket.id);
                        callback(response);
                    } catch (error) {
                        console.error("Error in joining room:", error);
                        callback({ success: false });
                    }
                }
            );

            socket.on("audioStream", ({ roomId, audio }: { roomId: string; audio: Buffer }) => {
                console.log(`Received audio from ${socket.id} in room ${roomId}`);
                const room = this.roomManager.getRoomById(roomId);
                if (room) {
                    room.handleAudioStream(socket.id, audio);
                }
            });

    
            socket.on("disconnect", async () => {
                await this.handleDisconnect(socket.id);
            });
        });

        return this.io;
    }

    
    private async handleDisconnect(peerId: string): Promise<void> {
        console.log(`Peer ${peerId} disconnected`);

        const allRoomIds = this.roomManager.getAllRoomIds();
        for (const roomId of allRoomIds) {
            const room = this.roomManager.getRoomById(roomId);
            if (room) {
                room.removePeer(peerId); 
            }
        }

        console.log(`Cleaned up peer ${peerId} from all rooms`);
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
