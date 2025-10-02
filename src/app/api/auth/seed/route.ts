import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Önce kullanıcının var olup olmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    });

    if (existingUser) {
      return NextResponse.json({ 
        message: "Test kullanıcısı zaten var", 
        userId: existingUser.id 
      });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Kullanıcı oluştur
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        emailVerified: new Date(),
      },
    });

    // Kullanıcı hesabı oluştur
    await prisma.account.create({
      data: {
        userId: user.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: user.id,
        id_token: hashedPassword, // Şifreyi id_token alanında sakla
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Test kullanıcısı oluşturuldu",
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error("Seed hatası:", error);
    return NextResponse.json({ error: "Seed işlemi başarısız oldu" }, { status: 500 });
  }
}
