import { z } from "zod";

export const createRoomSchema = z.object({
    roomName: z.string().min(1),
    prompt: z.string().min(1)
})