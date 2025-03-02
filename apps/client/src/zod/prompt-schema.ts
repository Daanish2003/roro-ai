import { z } from "zod";

export const PromptSchema = z.object({
	prompt: z.string().min(1),
	topic: z.string().min(1)
});

export type PromptSchemaType = z.infer<typeof PromptSchema>;