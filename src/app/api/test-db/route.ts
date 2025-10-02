import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    // Basit bir sorgu çalıştır
    const userCount = await prisma.user.count();
    
    return NextResponse.json({ 
      success: true, 
      message: "Veritabanı bağlantısı başarılı", 
      userCount 
    });
  } catch (error) {
    console.error("Veritabanı bağlantı hatası:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Veritabanı bağlantı hatası", 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
