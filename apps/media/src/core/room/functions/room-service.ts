import { createMediasoupRouter } from "../../mediasoup/functions/media-router.js";
import { mediasoupWorkerManager } from "../../mediasoup/managers/media-worker-manager.js";
import { Room } from "../classes/room.js";
import { roomManager } from "../manager/room-manager.js";

export const createRoom = async (roomId: string, topic: string, prompt: string, userId: string) =>  {
    if(!roomManager.hasRoom(roomId)) {
        try {
            const worker = await mediasoupWorkerManager.getAvailableWorker()
            const router = await createMediasoupRouter(worker)
            const room= new Room(roomId, topic, userId, router.id, prompt);
            roomManager.addRoom(room);
        } catch (error) {
            throw new Error(`Room Manager Failed to create room: ${error}`)
        }
    }
}

export const joinRoom = async (roomId: string, userId: string) => {
    if (!roomManager.hasRoom(roomId)) {
       return {
          success: false,
          message: "Room not found",
       }
    }
    
    const room = roomManager.getRoom(roomId);

    const response  = await room!.addParticipant(userId)

    return response
}