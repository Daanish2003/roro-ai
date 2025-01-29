
import { prisma } from "."

export const createRoom = async ({userId, name}: {userId: string, name: string}) => {
    try {
        const roomId = await prisma.room.create({
            select: {
                id: true
            },

            data: {
                adminId: userId,
                name,
                users: {
                    connect: { userId }
                }
            }
        })

        return roomId
    } catch (error) {
       throw new Error("Failed to create room", error as Error)
    }
} 