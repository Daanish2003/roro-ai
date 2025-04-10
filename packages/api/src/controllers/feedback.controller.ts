import { auth } from "../config/auth-config.js";
import { FeedbackSchema } from "../schema/feedbackSchema.js";
import { createFeedbackService, deleteAllFeedbackService, deleteFeedbackService, getAllFeedbackService, getFeedbackCount, getFeedbackService } from "../services/feedback.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fromNodeHeaders } from "better-auth/node";
import { Request, Response } from "express";

export const createFeedbackHandler = asyncHandler(async(req: Request, res: Response): Promise<any> => {
    try {
        const validatedFields = FeedbackSchema.safeParse(req.body)

        const data = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        })

        if(!data) {
            return res.status(400).json({ error: "Not Authorized "})
        }

        if(!validatedFields.success) {
            return res.status(400).json({
                error: "Invalid fields",
                details: validatedFields.error.flatten()
            })
        }

        const { feedbackType, subject, issue, details } = validatedFields.data

        const feedbackCount = await getFeedbackCount({ userId: data.user.id })

        if (feedbackCount >= 3) {
            return res.status(429).json({
                error: "Daily feedback limit reached",
                message: "You can only submit up to 3 feedback items per day.",
            })
        }

        const response = await createFeedbackService(
            { 
                feedbackType, 
                subject, 
                issue, 
                details, 
                userId: data!.user.id,
                username: data!.user.name
            }
        )

        return res.status(200).json({
            success: response.success
        })
    } catch (error) {
        console.error("Error creating feedback:", error);

        return res.status(500).json({
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
})

export const getAllFeedbacksHandler = asyncHandler(async(req: Request, res: Response): Promise<any> => {
    try {
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;

        const skip = (page - 1) * pageSize;
        const take = pageSize;

       if (skip < 0 || take < 1) {
        return res.status(400).json({ error: "Invalid pagination parameters" });
    }

        const { feedbacks, total} = await getAllFeedbackService({
           skip,
           take
        })

        return res.status(200).json({
            feedbacks,
            total,
            page,
            pageSize
        })

    } catch (error) {
        console.error("Error fetching all feedback:", error);

        return res.status(500).json({
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
})

export const getFeedbackHandler = asyncHandler(async(req: Request, res: Response): Promise<any> => {
    try {
        const feedbackId = req.params.id as string
        const feedback = await getFeedbackService({feedbackId})

        return res.status(200).json({
            feedback
        })
        
    } catch (error) {
        console.error("Error fetching feedback:", error);

        return res.status(500).json({
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
})

export const deleteAllFeedbacksHandler = asyncHandler(async(req: Request, res: Response): Promise<any> => {
    try {

        const feedbacks = await deleteAllFeedbackService()

        return res.status(200).json({
            feedbacks
        })

    } catch (error) {
        console.error("Error deleting all feedback:", error);

        return res.status(500).json({
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
})

export const deleteFeedbackHandler = asyncHandler(async(req: Request, res: Response): Promise<any> => {
    try {
        const feedbackId = req.params.id as string
        const response = await deleteFeedbackService({feedbackId})

        return res.status(200).json({
            success: response.success
        })
        
    } catch (error) {
        console.error("Error deleting feedback:", error);

        return res.status(500).json({
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
})

export const getFeedbackCountHandler = asyncHandler(async(req: Request, res: Response): Promise<any> => {
    const data = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    })

    if(!data) {
        return res.status(400).json({ error: "Not Authorized "})
    }

    const count = await getFeedbackCount({ userId: data.user.id})

    return res.status(200).json({
        count
    })
})