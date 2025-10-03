import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { Status } from "@/types";
import { calculateRisk } from "@/app/lib/rules";

const validStatuses: Status[] = ["NEW", "IN_REVIEW", "APPROVED", "REJECTED"];

// GET /api/items?status=&tag=&minScore=&id=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const statusParam = searchParams.get("status");
  const tag = searchParams.get("tag") || undefined;
  const minScoreRaw = searchParams.get("minScore");
  const minScore = Number.isFinite(Number(minScoreRaw)) ? Number(minScoreRaw) : 0;

  // Status değerini kontrol et
  const status = statusParam && validStatuses.includes(statusParam as Status) ? statusParam as Status : undefined;

  if (id) {
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  }

  const items = await prisma.item.findMany({
    where: {
      ...(status ? { status } : {}),
      AND: [
        tag && tag !== "undefined" ? { tags: { has: tag } } : {},
        { risk_score: { gte: minScore } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

// POST /api/items
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { title, description, amount, tags } = body as {
    title?: string; description?: string; amount?: number; tags?: string[];
  };

  if (!title || typeof amount !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Risk score hesapla
  const risk_score = calculateRisk(amount, Array.isArray(tags) ? tags : []);

  const item = await prisma.item.create({
    data: {
      title,
      description: description ?? "",
      amount: amount ?? 0,
      tags: Array.isArray(tags) ? tags : [],
      userId: (session.user as any).id, // session callback sayesinde garanti
      risk_score, // Risk score'u ekle
    },
  });
  
  await prisma.audit.create({
    data: {
      action: "Item created",
      userId: (session.user as any).id,
      itemId: item.id,
    },
  });

  return NextResponse.json(item, { status: 201 });
}

// PATCH /api/items
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id, status, tags, amount } = body as { 
    id?: string; status?: Status; tags?: string[]; amount?: number 
  };
  
  if (!id) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  // Mevcut öğeyi al
  const existingItem = await prisma.item.findUnique({ where: { id } });
  if (!existingItem) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  // Güncellenecek verileri hazırla
  const updateData: any = {};
  
  if (status && validStatuses.includes(status)) {
    updateData.status = status;
  }
  
  if (tags) {
    updateData.tags = tags;
  }
  
  if (amount !== undefined) {
    updateData.amount = amount;
  }
  
  // Risk score'u hesapla (tags veya amount değiştiyse)
  if (tags || amount !== undefined) {
    const calculationAmount = amount !== undefined ? amount : existingItem.amount;
    const calculationTags = tags || existingItem.tags;
    updateData.risk_score = calculateRisk(calculationAmount, calculationTags);
  }

  const updated = await prisma.item.update({ 
    where: { id }, 
    data: updateData 
  });

  // Audit kaydı oluştur
  let actionDescription = "Item updated";
  if (status) {
    actionDescription = `Status changed to ${status}`;
  }
  
  await prisma.audit.create({
    data: {
      action: actionDescription,
      userId: (session.user as any).id,
      itemId: id,
    },
  });

  return NextResponse.json(updated);
  
}


// DELETE /api/items?id=xxx
export async function DELETE(req: Request) {
const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const { searchParams } = new URL(req.url);
const id = searchParams.get("id");

if (!id) {
  return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
}

try {
  // Öğeyi bul
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  // Öğeye ait denetim kayıtlarını sil
  await prisma.audit.deleteMany({
    where: { itemId: id }
  });

  // Öğeyi sil
  await prisma.item.delete({
    where: { id }
  });

  return NextResponse.json({ 
    success: true, 
    message: "Item deleted successfully" 
  });
} catch (error) {
  console.error("Error deleting item:", error);
  return NextResponse.json({ 
    error: "An error occurred while deleting the item" 
  }, { status: 500 });
}
}
