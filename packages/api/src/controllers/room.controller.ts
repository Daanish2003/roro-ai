import { createRoomSchema } from "src/schema/createRoomSchema.js";
import { createRoomService } from "src/services/room.service.js";
import type { Request, Response } from 'express';
import { asyncHandler } from "src/utils/asyncHandler.js";


export const createRoom = asyncHandler(async(req: Request, res: Response): Promise<any> => {
    try {
        const validatedFields = createRoomSchema.safeParse(req.body);
    
        if (!validatedFields.success) {
          return res.status(400).json({
            error: "Invalid fields",
            details: validatedFields.error.flatten()
          });
        }
    
        const { userId, name } = validatedFields.data;
        const roomId = await createRoomService({ userId, name });
    
        return res.status(201).json({ roomId });
      } catch (error) {
        console.error("Error creating room:", error);
        return res.status(500).json({
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error occurred"
        });
      }
})