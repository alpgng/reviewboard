import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { calculateRisk } from "@/app/lib/rules";

// GET /api/score - Tüm öğelerin risk score'larını hesapla
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Tüm öğeleri getir
    const items = await prisma.item.findMany();
    let updatedCount = 0;

    // Her öğe için risk score'u yeniden hesapla
    for (const item of items) {
      const risk_score = calculateRisk(item.amount, item.tags);
      
      // Risk score'u güncelle
      await prisma.item.update({
        where: { id: item.id },
        data: { risk_score }
      });
      
      updatedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `${updatedCount} öğenin risk score'u güncellendi.` 
    });
  } catch (error) {
    console.error("Risk score hesaplama hatası:", error);
    return NextResponse.json({ 
      error: "Risk score hesaplanırken bir hata oluştu" 
    }, { status: 500 });
  }
}

// POST /api/score - Belirli bir öğenin risk score'unu hesapla
export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const risk = calculateRisk(item.amount, item.tags);

    const updated = await prisma.item.update({
      where: { id },
      data: { risk_score: risk },
    });

    await prisma.audit.create({
      data: {
        action: `Risk score recalculated: ${risk}`,
        userId: item.userId,
        itemId: item.id,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Risk score calculation error:", error);
    return NextResponse.json({ 
      error: "An error occurred while calculating risk score" 
    }, { status: 500 });
  }
}