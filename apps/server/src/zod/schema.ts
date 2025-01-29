import { z } from "zod";

export const createRoomSchema = z.object({
    userId: z.string().min(1),
    name: z.string().min(1)
})