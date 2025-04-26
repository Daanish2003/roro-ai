import { createRoomSchema, deleteRoomSchema } from "../schema/roomSchema.js";
import {
  createRoomService,
  deleteAllRoomService,
  deleteRoomService,
  getAllRoomsService,
  getRoomCountService,
  getRoomService
} from "../services/room.service.js";
import asyncHandler from "express-async-handler";
import { auth } from "../config/auth-config.js";
import { fromNodeHeaders } from "better-auth/node";
import { createRoomSession, verifyRoomSession } from "../utils/jwt.js";
import { v4 as uuidv4 } from "uuid";
import { redis } from "@roro-ai/database/client";
import { RequestHandler } from "express";

export const createRoomHandler: RequestHandler = asyncHandler(async (req, res): Promise<void> => {
  const validatedFields = createRoomSchema.safeParse(req.body);

  const data = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!data) {
    res
      .status(400)
      .json({ error: "Not Authenticated" });

    return;
  }

  if (!validatedFields.success) {
    res
      .status(400)
      .json({
        error: "Invalid fields",
        details: validatedFields.error.flatten()
      });

      return
  }

  const existingRoomCount = await getRoomCountService(data.session.userId);

  if ((existingRoomCount >= 3) && data.user.role !== "admin") {
    res
      .status(403)
      .json({ error: 'Room limit reached (max 3 rooms)' });

    return
  }

  const { roomName, prompt, topic } = validatedFields.data;

  const turnResponse = await fetch(process.env.TURN_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TURN_API_TOKEN}`
    },
    body: JSON.stringify({ ttl: 600 })
  });

  const turnCredentials = await turnResponse.json();

  const room = await createRoomService({
    userId: data.session.userId,
    roomName,
    username: data.user.name,
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
  });

  const sessionId = uuidv4();

  await redis.set(`room_session:${sessionId}`, room_session, 20 * 60);
  await redis.publish('createRoom', JSON.stringify(room));

  res
    .status(200)
    .cookie('room_session', sessionId, {
      domain: process.env.NODE_ENV === 'production' ? '.roro-ai.com' : undefined,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 60 * 20 * 1000),
      sameSite: 'lax',
      path: '/',
    })
    .json({
      roomId: room.id,
      iceServers: turnCredentials.iceServers
    });
});

export const verifyRoomAccessHandler: RequestHandler = asyncHandler(async (req, res): Promise<void> => {
  const roomId = req.params.id;

  if (!roomId) {
    res
      .status(400)
      .json({ isValid: false, message: "Missing roomId" });

    return
  }

  const roomSessionId = req.cookies.room_session;
  const roomSessionToken = await redis.get(`room_session:${roomSessionId}`);

  if (!roomSessionToken) {
    res
      .status(401)
      .json({ isValid: false });

    return
  }

  const { userId, roomId: room_id, expiresAt } = await verifyRoomSession(roomSessionToken);

  if (expiresAt < Date.now()) {
    await redis.del(`room_session:${roomSessionId}`);
    res
      .status(401)
      .json({ isValid: false });
    return
  }

  const auth_session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });

  if (auth_session?.session.userId !== userId || roomId !== room_id) {
    res
      .status(401)
      .json({ isValid: false });

    return
  }

  res
    .status(200)
    .json({ isValid: true });

});

export const getAllUserRoomHandler: RequestHandler = asyncHandler(async (req, res): Promise<void> => {
  const page = Number(req.query.page) || 0;
  const pageSize = Number(req.query.pageSize) || 10;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  if (skip < 0 || take < 1) {
    res
      .status(400)
      .json({ error: "Invalid pagination parameters" });

    return
  }

  const data = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });

  if(!data) {
    res.status(401).json({ error: "Not Authenticated" });
    return
  }

  const { rooms, total } = await getAllRoomsService({
    userId: data.user.id,
    skip,
    take
  });

  res
    .status(200)
    .json({
      rooms,
      total,
      page,
      pageSize
    });
});

export const getUserRoomHandler: RequestHandler = asyncHandler(async (req, res): Promise<void> => {
  const roomId = req.params.id;

  if (!roomId) {
    res
      .status(400)
      .json({ isValid: false, message: "Missing roomId" });

    return
  }

  const data = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });

  const rooms = await getRoomService({
    userId: data!.user.id,
    roomId
  });

  res
    .status(200)
    .json({ rooms });
});

export const deleteRoomHandler: RequestHandler = asyncHandler(async (req, res): Promise<void> => {
  const roomId = req.params.id;

  if (!roomId) {
    res
      .status(400)
      .json({ isValid: false, message: "Missing roomId" });

    return
  }

  const data = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });

  const { success } = await deleteRoomService({
    userId: data!.user.id,
    roomId
  });

  res
    .status(200)
    .json({ success });
});

export const deleteAllRoomHandler: RequestHandler = asyncHandler(async (req, res): Promise<void> => {
  const validatedFields = deleteRoomSchema.safeParse(req.body);

  if (!validatedFields.success) {
    res
      .status(400)
      .json({
        error: "Invalid fields",
        details: validatedFields.error.flatten()
      });

    return
  }

  const data = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });

  const { roomId } = validatedFields.data;

  const { success } = await deleteAllRoomService({
    userId: data!.user.id,
    roomId
  });

  res
    .status(200)
    .json({ success });
});

export const getRoomCountHandler: RequestHandler = asyncHandler(async (req, res): Promise<void> => {
  const data = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!data) {
    res
      .status(400)
      .json({ error: "Not Authenticated" });
      return
  }

  const count = await getRoomCountService(data.user.id);

  res
    .status(200)
    .json({ count });
});
