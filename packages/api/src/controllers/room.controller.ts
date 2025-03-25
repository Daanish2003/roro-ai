import { createRoomSchema } from "../schema/roomSchema.js";
import { createRoomService, deleteAllRoomService, deleteRoomService, getAllRoomsService, getRoomService } from "../services/room.service.js";
import type { Request, Response } from 'express';
import { asyncHandler } from "../utils/asyncHandler.js";
import { auth } from "../config/auth-config.js";
import { fromNodeHeaders } from "better-auth/node";
import { createRoomSession, verifyRoomSession } from "../utils/jwt.js";
import { v4 as uuidv4} from "uuid"
import { deleteRoomSchema } from '../schema/roomSchema.js';
import { redis } from "@roro-ai/database/client";
import { redisPub } from "../utils/redis.js";


export const createRoomHandler = asyncHandler(async(req: Request, res: Response): Promise<any> => {
    try {
        const validatedFields = createRoomSchema.safeParse(req.body);

        const data = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers)
        })
    
        if (!validatedFields.success) {
          return res.status(400).json({
            error: "Invalid fields",
            details: validatedFields.error.flatten()
          });
        }
    
        const { roomName, prompt, topic } = validatedFields.data;

        const room = await createRoomService(
          { 
            userId: data?.session.userId as string, 
            roomName, 
            username: data?.user.name as string,
            prompt,
            topic
          });

        const room_session = await createRoomSession({
          userId: room.userId,
          username: room.username,
          roomId: room.id,
          roomName: room.name,
          topic: room.topic,
          prompt: room.prompt
        })

        const sessionId = uuidv4()

        await redis.set(`room_session:${sessionId}`, room_session, 20 * 60)

        await redisPub.publish('createRoom', JSON.stringify(room))


        res.status(200).cookie('room_session', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          expires: new Date(Date.now() + 60 * 20 * 1000),
          sameSite: 'lax' as "lax" | "strict" | "none",
          path: '/',
        }).json(
          {
            roomId: room.id
          }
        )

      } catch (error) {

        console.error("Error creating room:", error);

        return res.status(500).json({
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error occurred"
        });
      }
})

export const verifyRoomAccessHandler = asyncHandler(async(req: Request, res:Response): Promise<any> => {
  
  try {
    const roomId = req.params.id

    if (!roomId) {
      return res.status(400).json({ isValid: false, message: "Missing roomId" });
    }

    const roomSessionId = req.cookies.room_session;


    const roomSessionToken = await redis.get(`room_session:${roomSessionId}`);


    if(!roomSessionToken) {
      return res.status(401).json({ isValid: false });
    }

    const { userId, roomId: room_id , expiresAt} = await verifyRoomSession(roomSessionToken);


    if(expiresAt <  Date.now()) {
       await redis.del(`room_session:${roomSessionId}`)
       return res.status(401).json({ isValid: false });
    }

    const auth_session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    })

    if(auth_session?.session.userId !== userId) {
      return res.status(401).json({ isValid: false })
    }

    if (roomId !== room_id) {
      return res.status(401).json({ isValid: false })
    }

    return res.status(200).json({ isValid: true })
  } catch (error) {
    
    console.error("Error verifying room:", error);

    return { isValid: false}
    
  }
})

export const getAllUserRoomHandler = asyncHandler(async(req: Request, res: Response): Promise<any> => {
  try {
       const page = Number(req.query.page) || 0
       const pageSize = Number(req.query.pageSize) || 10;

       const skip = (page - 1) * pageSize;
        const take = pageSize;
       
      if (skip < 0 || take < 1) {
        return res.status(400).json({ error: "Invalid pagination parameters" });
      }

        const data = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers)
        })

        const { rooms, total} = await getAllRoomsService(
          {
            userId: data?.user.id as string,
            skip,
            take
          })

        return res.status(200).json({
          rooms,
          total,
          page,
          pageSize
        })

  } catch (error) {
    console.error("Error getting all room:", error);

        return res.status(500).json({
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error occurred"
        });
  }
})

export const getUserRoomHandler = asyncHandler(async(req: Request, res: Response): Promise<any> => {
  try {
      const roomId = req.params.id

        if (!roomId) {
           return res.status(400).json({ isValid: false, message: "Missing roomId" });
        }

        const data = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers)
        })


        const rooms = await getRoomService(
          {
            userId: data!.user.id,
            roomId
          })

        return res.status(200).json({
          rooms
        })
        
  } catch (error) {
    console.error("Error getting room:", error);

        return res.status(500).json({
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error occurred"
        });
  }
})

export const deleteRoomHandler = asyncHandler(async(req: Request, res: Response): Promise<any> => {
  try {
      const roomId = req.params.id

        if (!roomId) {
           return res.status(400).json({ isValid: false, message: "Missing roomId" });
        }

        const data = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers)
        })


        const { success } = await deleteRoomService(
          {
            userId: data!.user.id,
            roomId
          })

        return res.status(200).json({
          success: success
        })
        
  } catch (error) {
    console.error("Error deleting room:", error);

        return res.status(500).json({
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error occurred"
        });
  }
})

export const deleteAllRoomHandler = asyncHandler(async(req: Request, res: Response): Promise<any> => {
  try {
        const validatedFields = deleteRoomSchema.safeParse(req.body)
        const data = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers)
        })

        if (!validatedFields.success) {
          return res.status(400).json({
            error: "Invalid fields",
            details: validatedFields.error.flatten()
          });
        }

        const { roomId } = validatedFields.data


        const { success } = await deleteAllRoomService(
          {
            userId: data!.user.id,
            roomId
          })

        return res.status(200).json({
          success: success
        })
        
  } catch (error) {
    console.error("Error deleting room:", error);

        return res.status(500).json({
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error occurred"
        });
  }
})