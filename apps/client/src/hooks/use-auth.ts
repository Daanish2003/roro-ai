"use client"

import { signIn } from "@/features/auth/auth-client";
import { useState } from "react";
import { toast } from "sonner";

export const useAuth = () => {
    const [loading, setLoading] = useState(false);

    async function socialSignInHandler (provider: 'github'| 'google') {
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
    }
    return {
        socialSignInHandler,
        loading,
    }
}