import { NextRequest, NextResponse } from "next/server";

export function extractRoomId(url: URL): string | null {
  const pathSegments = url.pathname.split('/');
  return pathSegments[2] || null; 
}

export async function verifyRoomAccess(roomId: string, request: NextRequest): Promise<boolean> {
  try {
    const response = await fetch(new URL(`/api/v1/rooms/${roomId}/verify-access`, process.env.NEXT_PUBLIC_BACKEND_URL), {
      headers: { 
        cookie: request.headers.get('cookie') || '',
      }

    });
    
    if (!response.ok) return false;
    
    const { isValid } = await response.json();
    return isValid;
  } catch (error) {
    console.error('Room verification error:', error);
    return false;
  }
}

export function redirectToDashboard(request: NextRequest, reason?: string) {
    const dashboardUrl = new URL('/dashboard/overview', request.url);
    if (reason) {
      dashboardUrl.searchParams.set('error', encodeURIComponent(reason));
    }
    return NextResponse.redirect(dashboardUrl);
  }