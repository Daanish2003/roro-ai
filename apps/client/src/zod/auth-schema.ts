import { z } from "zod";

export const LoginFormSchema = z.object({
    email: z
       .string()
       .email({message: "Invalid email"})
       .min(1, {message: "Email is required"}),
    password: z
       .string()
       .min(8, {message: "Password must be at least 8 characters long"})
       .max(20, {message: "Password must be at most 20 characters long"}),
})

export const SignUpFormSchema = z.object({
    name: z
       .string()
       .min(1, {message: "name is required"})
       .max(100, {message: "name should not exceed 100 characters" }),
    email: z
       .string()
       .email({message: "Invalid email"})
       .min(1, {message: "Email is required"}),
    password: z
       .string()
       .min(8, {message: "Password must be at least 8 characters long"})
       .max(20, {message: "Password must be at most 20 characters long"}),
})

export const ForgotPasswordSchema = z.object({
   email: z
   .string()
   .email({message: "Invalid type"}) 
   .min(1, {message: "Email is required"}),
})

export const ResetPasswordSchema = z.object({
   password: z
   .string()
   .min(8, { message: "Password must be at least 8 characters long" }) // checks for character length
   .max(20, { message: "Password must be at most 20 characters long" }),
 confirmPassword: z
   .string()
   .min(8, { message: "Password must be at least 8 characters long" })
   .max(20, { message: "Password must be at most 20 characters long" }),
}).refine((data) => data.password === data.confirmPassword, {
   message: "Passwords do not match",
   path: ["confirmPassword"],
});

