import { FeedbackSchema } from "../schema/feedbackSchema.js";
import {
  createFeedbackService,
  deleteAllFeedbackService,
  deleteFeedbackService,
  getAllFeedbackService,
  getFeedbackCount,
  getFeedbackService
} from "../services/feedback.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { auth } from "../config/auth-config.js";
import { fromNodeHeaders } from "better-auth/node";
import { Request, Response } from "express";

export const createFeedbackHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const validatedFields = FeedbackSchema.safeParse(req.body);

  const data = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!data) {
    res.status(400).json({ error: "Not Authenticated" });
    return;
  }

  if (!validatedFields.success) {
    res.status(400).json({
      error: "Invalid fields",
      details: validatedFields.error.flatten()
    });
    return;
  }

  const feedbackCount = await getFeedbackCount({ userId: data.user.id });

  if (feedbackCount >= 3) {
    res.status(429).json({
      error: "Daily feedback limit reached",
      message: "You can only submit up to 3 feedback items per day.",
    });
    return;
  }

  const { feedbackType, subject, issue, details } = validatedFields.data;

  const response = await createFeedbackService({
    feedbackType,
    subject,
    issue,
    details,
    userId: data.user.id,
    username: data.user.name
  });

  res.status(200).json({ success: response.success });
});

export const getAllFeedbacksHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  if (skip < 0 || take < 1) {
    res.status(400).json({ error: "Invalid pagination parameters" });
    return;
  }

  const { feedbacks, total } = await getAllFeedbackService({ skip, take });

  res.status(200).json({
    feedbacks,
    total,
    page,
    pageSize
  });
});

export const getFeedbackHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const feedbackId = req.params.id;

  if (!feedbackId) {
    res.status(400).json({ error: "Missing feedbackId" });
    return;
  }

  const feedback = await getFeedbackService({ feedbackId });

  res.status(200).json({ feedback });
});

export const deleteFeedbackHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const feedbackId = req.params.id;

  if (!feedbackId) {
    res.status(400).json({ error: "Missing feedbackId" });
    return;
  }

  const response = await deleteFeedbackService({ feedbackId });

  res.status(200).json({ success: response.success });
});

export const deleteAllFeedbacksHandler = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const feedbacks = await deleteAllFeedbackService();
  res.status(200).json({ feedbacks });
});

export const getFeedbackCountHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!data) {
    res.status(400).json({ error: "Not Authenticated" });
    return;
  }

  const count = await getFeedbackCount({ userId: data.user.id });

  res.status(200).json({ count });
});
