import { z } from "zod";

export const IssueCategoryEnum = z.enum(["USER_INTERFACE", "PERFORMANCE", "BUG", "ACCOUNT", "OTHERS"]);
export const FeedbackTypeEnum = z.enum(["SUGGESTION", "ISSUE", "QUESTION"]);


export const FeedbackSchema = z.object({
    feedbackType: FeedbackTypeEnum,
    subject: z.string().min(1).max(30),
    details: z.string().min(1),
    issue: IssueCategoryEnum.optional().nullable()
}) 

export type FeedbackFormValues = z.infer<typeof FeedbackSchema>;

export interface Feedback extends FeedbackFormValues {
    userId: string,
    username: string
}
