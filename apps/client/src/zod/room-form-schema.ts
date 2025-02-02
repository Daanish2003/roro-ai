import { z } from "zod"

const scenarioSchema = z.discriminatedUnion("category", [
  z.object({
    category: z.literal("everyday"),
    subCategory: z.enum(["greeting", "shopping", "restaurant"]),
  }),
  z.object({
    category: z.literal("professional"),
    subCategory: z.enum(["interview", "meeting", "presentation"]),
  }),
  z.object({
    category: z.literal("travel"),
    subCategory: z.enum(["hotel", "flight", "directions"]),
  }),
  z.object({
    category: z.literal("creative"),
    subCategory: z.enum(["storytelling", "role-play", "debate"]),
  }),
]);

export const RoomFormSchema = z.object({
  roomId: z.string().min(1, "roomId is required"),
  username: z.string().min(1, "username is required"),
  userId: z.string().min(1, "userId is required"),
  roomName: z.string().min(1, "roomName is required"),
  scenario: scenarioSchema,
});

