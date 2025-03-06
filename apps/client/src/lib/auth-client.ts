"use client"
import { adminClient, anonymousClient, jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
	plugins: [anonymousClient(), adminClient(), jwtClient()],
	fetchOptions: {
		onSuccess: (ctx) => {
			const authToken = ctx.response.headers.get('set-auth-token')
			console.log(authToken)
		}
	}
});


export const { signIn, signOut, signUp, useSession, getSession, $Infer, updateUser, deleteUser} = authClient;