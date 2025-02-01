import { createRoomSchema } from "../schema/createRoomSchema.js";
import { createRoomService } from "../services/room.service.js";
import type { Request, Response } from 'express';
import { asyncHandler } from "../utils/asyncHandler.js";
import { auth } from "../config/auth-config.js";
import { fromNodeHeaders } from "better-auth/node";
import { createRoomSession, verifyRoomSession } from "../utils/jwt.js";
import { redis } from "@roro-ai/database/client";
import { v4 as uuidv4} from "uuid"


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
    
        const { roomName } = validatedFields.data;

        console.log(roomName)

        const room = await createRoomService(
          { 
            userId: data?.session.userId as string, 
            roomName, 
            username: data?.user.name as string
          });

        const room_session = await createRoomSession({
          userId: room.userId,
          username: room.username,
          roomId: room.id,
          roomName: room.name
        })

        const sessionId = uuidv4()

        console.log(sessionId)

        await redis.set(`room_session:${sessionId}`, room_session, 20 * 60)

        console.log(room_session)

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

    const auth_session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    })

    const roomSessionId = req.cookies.room_session;

    console.log(roomSessionId)


    const roomSessionToken = await redis.get(`room_session:${roomSessionId}`);

    console.log(roomSessionToken)

    if(!roomSessionToken) {
      return res.status(401).json({ isValid: false });
    }

    const room_session = await verifyRoomSession(roomSessionToken);

    if(auth_session?.session.userId !== room_session?.userId) {
      return res.status(401).json({ isValid: false })
    }

    if (roomId !== room_session?.roomId) {
      return res.status(401).json({ isValid: false })
    }

    return res.status(200).json({ isValid: true })
  } catch (error) {
    console.error("Error verifying room:", error);

    return { isValid: false}
    
  }

})