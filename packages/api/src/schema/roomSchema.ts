import { z } from "zod";

export const createRoomSchema = z.object({
    roomName: z.string().min(1),
    prompt: z.string().min(1),
    topic: z.string().min(1)
})

export const getRoomSchema = z.object({
    roomId: z.string().min(1)
})

export const deleteRoomSchema = z.object({
    roomId: z.array(z.string().min(1)).min(1)
})