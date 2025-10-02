import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Veritabanı bağlantısını test et
    const userCount = await prisma.user.count();
    
    // Test kullanıcısı oluştur (gerçek kayıt değil, sadece test)
    const testUser = {
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
      password: "password123"
    };
    
    // Şifre hash'leme işlemini test et
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    
    return NextResponse.json({ 
      success: true, 
      message: "Test başarılı", 
      userCount,
      testUser: {
        name: testUser.name,
        email: testUser.email,
        passwordHashed: !!hashedPassword
      }
    });
  } catch (error) {
    console.error("Test hatası:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Test başarısız", 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
