import { z } from "zod";

export const createRoomSchema = z.object({
    roomName: z.string().min(1),
})