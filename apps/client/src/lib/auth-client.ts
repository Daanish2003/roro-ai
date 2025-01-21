import { adminClient, anonymousClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_APP_URL,
	plugins: [anonymousClient(), adminClient()],
});


export const { signIn, signOut, signUp, useSession, getSession, } = authClient;