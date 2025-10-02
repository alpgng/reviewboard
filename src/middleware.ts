// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Korumalı rotalar
const protectedRoutes = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Korumalı rotaları kontrol et
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // Oturum yoksa, giriş sayfasına yönlendir
    if (!token) {
      const url = new URL("/auth/signin", request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Middleware'in hangi yollar için çalışacağını belirt
export const config = {
  matcher: [
    // Korumalı rotalar
    "/dashboard/:path*",
    
    // Diğer korumalı rotalar
    "/api/items/:path*",
    
    // Giriş sayfasını hariç tut
    "/((?!api|_next/static|_next/image|favicon.ico|auth/signin).*)",
  ],
};
