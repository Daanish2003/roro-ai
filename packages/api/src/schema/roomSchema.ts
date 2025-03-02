import { z } from "zod";

export const createRoomSchema = z.object({
    roomName: z.string().min(1),
    prompt: z.string().min(1)
})

export const getRoomSchema = z.object({
    roomId: z.string().min(1)
})