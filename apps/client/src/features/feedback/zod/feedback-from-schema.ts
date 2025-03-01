import { z } from "zod";

export const IssueCategoryEnum = z.enum(["User Interface", "Performance", "Bug", "Account", "Others"]);
export const FeedbackTypeEnum = z.enum(["Suggestion", "Issue", "Question"]);


export const FeedbackFormSchema = z.object({
    feedbackType: FeedbackTypeEnum,
    subject: z.string().min(1).max(30),
    details: z.string().min(1),
    issue: IssueCategoryEnum.optional()
}) 

export type FeedbackFormValues = z.infer<typeof FeedbackFormSchema>;
