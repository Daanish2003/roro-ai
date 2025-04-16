"use client"

import { forgetPassword, resetPassword, signIn, signUp } from "@/features/auth/auth-client";
import { ForgotPasswordSchema, LoginFormSchema, ResetPasswordSchema, SignUpFormSchema } from "@/zod/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const useAuth = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false);

    const signupForm = useForm<z.infer<typeof SignUpFormSchema>>({
        resolver: zodResolver(SignUpFormSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        }
    })

    const loginForm = useForm<z.infer<typeof LoginFormSchema>>({
        resolver: zodResolver(LoginFormSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    })

    const forgotPasswordForm = useForm<z.infer<typeof ForgotPasswordSchema>>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
          email: '',
        }
      })

    const resetPasswordForm = useForm<z.infer<typeof ResetPasswordSchema>>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: ''
        }
    })

    async function resetPasswordHandler(values: z.infer<typeof ResetPasswordSchema>){
        try {
            await resetPassword({
                newPassword: values.password,
            }, {
                onResponse: () => {
                    setLoading(false)
                },
                onRequest: () => {
                    setLoading(true)
                },
                onSuccess: () => {
                    toast("New Password Created", {
                        description: "New password has been created successfully",
                        action: {
                          label: "Undo",
                          onClick: () => console.log("Undo"),
                        },
                    })
                    router.replace('/auth/login')
                },
                onError: (ctx) => {
                    toast("Failed to create new password", {
                        description: ctx.error.message,
                        action: {
                          label: "Undo",
                          onClick: () => console.log("Undo"),
                        },
                    })
                },
            })
        } catch (error) {
            console.log(error)
            toast("Failed to reset password", {
                description: "Something went wrong, please try again later..",
                action: {
                  label: "Undo",
                  onClick: () => console.log("Undo"),
                },
            })
        }
    } 

    async function forgotPasswordHandler(values: z.infer<typeof ForgotPasswordSchema>) {
        try {
            await forgetPassword({
                email: values.email,
                redirectTo: `${process.env.NEXT_PUBLIC_CLIENT_URL}/auth/reset-password`
            }, {
                onResponse: () => {
                    setLoading(false)
                  },
                  onRequest: () => {
                    setLoading(true)
                  },
                  onSuccess: () => {
                    toast("Email sent", {
                        description: "Reset password link has been sent",
                        action: {
                          label: "Undo",
                          onClick: () => console.log("Undo"),
                        },
                    })
                  },
                  onError: (ctx) => {
                    toast("Failed to reset password", {
                        description: ctx.error.message,
                        action: {
                          label: "Undo",
                          onClick: () => console.log("Undo"),
                        },
                    })
                  },
          
            })
        } catch (error) {
            console.log(error)
            toast("Failed to reset password", {
                description: "Something went wrong, please try again later..",
                action: {
                  label: "Undo",
                  onClick: () => console.log("Undo"),
                },
            })
        }
    }

    async function emailSignUpHandler(values: z.infer<typeof SignUpFormSchema>) {
        try {
            await signUp.email({
                name: values.name,
                email: values.email,
                password: values.password,
                callbackURL: `${process.env.NEXT_PUBLIC_CLIENT_URL}/practice`
            }, {
                onResponse: () => {
                    setLoading(false)
                },
                onRequest: () => {
                    setLoading(true)
                },
                onSuccess: () => {
                    toast("Account created", {
                        description: "You have created account successfully",
                        action: {
                          label: "Undo",
                          onClick: () => console.log("Undo"),
                        },
                    })
                },
                onError: (ctx) => {
                    if (ctx.error.status === 403) {
                        toast("SignUp Failed", {
                            description: "Please verify your email address",
                            action: {
                                label: "Undo",
                                onClick: () => console.log("Undo"),
                            },
                        })
                    }
                    toast("SignUp Failed", {
                        description: ctx.error.message,
                        action: {
                            label: "Undo",
                            onClick: () => console.log("Undo"),
                        },
                    })
                }
            })
        } catch (err) {
            toast("SignUp Failed", {
                description: (err as Error).message,
                action: {
                    label: "Undo",
                    onClick: () => console.log("Undo"),
                },
            })
        }
    }

    async function emailLoginHandler(values: z.infer<typeof LoginFormSchema>) {
        try {
            await signIn.email({
                email: values.email,
                password: values.password,
                callbackURL: `${process.env.NEXT_PUBLIC_CLIENT_URL}/practice`
            }, {
                onResponse: () => {
                    setLoading(false)
                },
                onRequest: () => {
                    setLoading(true)
                },
                onSuccess: () => {
                    toast("Login Success", {
                        description: "You have logged In successfully",
                        action: {
                          label: "Undo",
                          onClick: () => console.log("Undo"),
                        },
                    })
                },
                onError: (ctx) => {
                    toast("Login Failed", {
                        description: ctx.error.message,
                        action: {
                            label: "Undo",
                            onClick: () => console.log("Undo"),
                        },
                    })
                }
            })
        } catch (err) {
            toast("Login Failed", {
                description: (err as Error).message,
                action: {
                    label: "Undo",
                    onClick: () => console.log("Undo"),
                },
            })
        }
    }

    async function socialSignInHandler (provider: 'github'| 'google') {
        try {
            await signIn.social({
                provider,
                callbackURL: `${process.env.NEXT_PUBLIC_CLIENT_URL}/practice`
            }, {
                onSuccess : () => {
                    toast("Login Success", {
                        description: "You have logged In successfully",
                        action: {
                          label: "Undo",
                          onClick: () => console.log("Undo"),
                        },
                    })
                },
                onError: (ctx) => {
                    toast("Login Failed", {
                        description: ctx.error.message,
                        action: {
                            label: "Undo",
                            onClick: () => console.log("Undo"),
                        },
                    })
                },
                onRequest: () => {
                    setLoading(true)
                },
                onResponse: () => {
                    setLoading(false)
                }
            })
        } catch (error) {
            toast("Login Failed", {
                description: (error as Error).message,
                action: {
                    label: "Undo",
                    onClick: () => console.log("Undo"),
                },
            })
        }
    }
    return {
        signupForm,
        loginForm,
        forgotPasswordForm,
        resetPasswordForm,
        resetPasswordHandler,
        emailLoginHandler,
        emailSignUpHandler,
        socialSignInHandler,
        forgotPasswordHandler,
        loading,
    }
}