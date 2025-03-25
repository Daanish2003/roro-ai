"use client"

import { signIn } from "@/features/auth/auth-client";
import { useRouter } from "next/navigation"
import { useState } from "react";
import { toast } from "sonner";

export const useAuth = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function socialSignInHandler (provider: 'github'| 'google') {
        await signIn.social({
            provider,
            callbackURL: `${process.env.NEXT_PUBLIC_CLIENT_URL}/dashboard/practice`
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

    async function anonymousSignInHandler() {
			await signIn.anonymous(
				{},
				{
					onSuccess: () => {
						toast("Login Successfully", {
							description: "You have logged In successfully",
                            action: {
                               label: "Undo",
                               onClick: () => console.log("Undo"),
                            },
						});
						router.replace("/dashboard/practice")
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
					onRequest: () => setLoading(true),
					onResponse: () => setLoading(false),
				},
			);
	};
    return {
        socialSignInHandler,
        anonymousSignInHandler,
        loading,
    }
}