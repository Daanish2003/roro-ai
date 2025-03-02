import { prisma } from "@roro-ai/database/client"


export const createRoomService = async (
    {
        userId, 
        roomName, 
        username,
        prompt
    }: {
        userId: string, 
        roomName: string, 
        username: string,
        prompt: string
    }) => {
    try {
        const room = await prisma.room.create({
            select: {
                id: true,
                name: true,
                username: true,
                userId: true,
            },
            data: {
                name: roomName,
                username, 
                userId,
                prompt
            }
        })

        return room

    } catch (error) {
       console.log("Create Room Error:", error)
       throw new Error("Failed to create room")
    }
}

export const getAllRoomsService = async (
    {
        userId 
    } : {
        userId: string
    }
) => {
    try {
        const rooms = await prisma.room.findMany({
            where: {
                userId
            }
        })

        return rooms
    } catch (error) {
        console.log("Get All Room Error:", error)
        throw new Error("Failed to get all room")
     }
}

export const getRoomService = async (
    {
        userId,
        roomId 
    } : {
        userId: string,
        roomId: string
    }
) => {
    try {
        const room = await prisma.room.findUnique({
            where: {
                id: roomId,
                userId,
            }
        })

        return room
    } catch (error) {
        console.log("Get Room Error:", error)
        throw new Error("Failed to get room")
     }
}

export const deleteRoomService = async (
    {
        userId,
        roomId 
    } : {
        userId: string,
        roomId: string
    }
) => {
    try {
        await prisma.room.delete({
            where: {
                id: roomId,
                userId,
            }
        })

        return {
            success: true
        }
    } catch (error) {
        console.log("Delete Room Error:", error)
        throw new Error("Failed to delete room")
     }
}

export const deleteAllRoomService = async (
    {
        userId,
    } : {
        userId: string,
    }
) => {
    try {
        await prisma.room.deleteMany({
            where: {
                userId,
            }
        })

        return {
            success: true
        }
    } catch (error) {
        console.log("Delete All Room Error:", error)
        throw new Error("Failed to delete all room")
     }
}

