import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({ 
      success: true, 
      authenticated: !!session,
      session: session ? {
        user: session.user,
        expires: session.expires
      } : null
    });
  } catch (error) {
    console.error("Oturum test hatası:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Oturum bilgileri alınamadı",
      errorDetails: (error as Error).message
    }, { status: 500 });
  }
}
