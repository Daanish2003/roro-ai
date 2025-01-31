import { NextResponse, type NextRequest } from "next/server";
import { redirectToLogin, verifySession } from "./middleware/authMiddleware";
import { extractRoomId, redirectToDashboard, verifyRoomAccess } from "./middleware/roomMiddleware";
import { AuthRoutes, matchesProtectedRoute, PublicRoutes } from "./middleware/routes";


export async function middleware(request: NextRequest) {
  const isPublicRoute = PublicRoutes.includes(request.nextUrl.pathname);
  const isProtectedRoute = matchesProtectedRoute(request.nextUrl.pathname);
  const isAuthRoute = AuthRoutes.includes(request.nextUrl.pathname)
  const isRoomRoute = request.nextUrl.pathname.startsWith("/room/");

  const session = await verifySession(request);

  if (isProtectedRoute && !session) return redirectToLogin(request);

  if ((isPublicRoute || isAuthRoute) && session) return redirectToDashboard(request)

  if (isAuthRoute && session) return redirectToDashboard(request)

  
  if (isRoomRoute && session) {
	
	const roomId = extractRoomId(request.nextUrl);
    if(!roomId) {
		return redirectToDashboard(request, "Room ID is missing");
	}

	const hasRoomAccess = await verifyRoomAccess(roomId, request);
     if (!hasRoomAccess) {
       return redirectToDashboard(request, "No access to this room");
     }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)'
  ],
};