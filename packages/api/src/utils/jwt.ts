
import { SignJWT, jwtVerify } from "jose"

type RoomPayload = {
  roomId: string,
  roomName: string,
  username: string,
  userId: string,
  expiresAt: Date
}

const secretKey = process.env.ROOM_SECRET;
export const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: RoomPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('20m')
    .sign(key);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.error("Failed to decrypt token: ", error)
    return null;
  }
}

export async function createRoomSession(
  {
    userId,
    roomId,
    roomName,
    username
  } : {
    userId: string,
    roomId: string,
    roomName: string,
    username: string,
  }
) {
  const expiresAt = new Date(Date.now() + 60 * 20 * 1000);
  const session = await encrypt({ userId, roomId, roomName, username , expiresAt})
  return session
}

export async function verifyRoomSession(roomSessionToken: string){
  const room_session = await decrypt(roomSessionToken)

  if(!room_session?.roomId) {
    console.error("Room Id is not available")
  }

  return room_session

}