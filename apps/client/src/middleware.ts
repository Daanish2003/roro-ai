import { betterFetch } from "@better-fetch/fetch";
import type { User, Session } from "better-auth/types";
import { NextResponse, type NextRequest } from "next/server";

type DataSession = {
    user: User;
    session: Session;
}

export default async function authMiddleware(request: NextRequest) {
	const { data: session, error } = await betterFetch<DataSession>(
		"/api/get-session",  // Updated to match the Express route
		{
			baseURL: "http://localhost:4000",  // Change to your Express server URL
			headers: {
				// Forward the cookies from the request
				cookie: request.headers.get("cookie") || "",
			},
			credentials: "include",  // Ensure cookies are sent with the request
		},
	);

    if(error) {
        console.log(error.message)
    }

	if (!session) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}
	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard"],
};
