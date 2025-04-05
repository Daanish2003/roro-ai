"use client"
import { adminClient, jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
	plugins: [adminClient(), jwtClient()],
});


export const { signIn, signOut, signUp, useSession, getSession, $Infer, updateUser, deleteUser, token} = authClient;