import { prisma } from "@roro-ai/database/client";
import { Feedback } from "../schema/feedbackSchema.js";

export const createFeedbackService = async ({
    feedbackType,
    details,
    issue,
    subject,
    userId,
    username
}: Feedback) => {
    try {
        
        await prisma.feedback.create({
            data: {
                userId,
                subject,
                details,
                feedbackType ,
                issue,
                username
            }
        })

        return {
            success: true
        }
    } catch (error) {
       console.log("Create Feedback Error:", error)
       throw new Error("Failed to create feedback")  
    }
}

export const getAllFeedbackService = async (
    { 
        skip, 
        take
    }: {
        skip: number,
        take: number
    }) => {
    try {
        const feedbacks = await prisma.feedback.findMany({
            skip,
            take,
        })

        const total = await prisma.feedback.count()

        return {
            total,
            feedbacks
        }
    } catch (error) {
        console.log("Get All Feedback Error:", error)
       throw new Error("Failed to create feedback")  
    }
}

export const getFeedbackService = async ({ feedbackId}: {feedbackId: string}) => {
    try {
        const feedbacks = await prisma.feedback.findUnique({
            where: {
                id: feedbackId
            }
        })

        return feedbacks
    } catch (error) {
        console.log("Get All Feedback Error:", error)
       throw new Error("Failed to create feedback")  
    }
}

export const deleteAllFeedbackService = async () => {
    try {
        await prisma.feedback.deleteMany()

        return {
            success: true
        }
    } catch (error) {
        console.log("Delete All Feedback Error:", error)
       throw new Error("Failed to create feedback")  
    }
}

export const deleteFeedbackService = async ({ feedbackId}: {feedbackId: string}) => {
    try {
        await prisma.feedback.delete({
            where: {
                id: feedbackId
            }
        })

        return {
            success: true
        }
    } catch (error) {
        console.log("Delete Feedback Error:", error)
       throw new Error("Failed to create feedback")  
    }
}