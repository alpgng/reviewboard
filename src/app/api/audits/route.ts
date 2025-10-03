import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

// GET /api/audits?itemId=
export async function GET(req: Request) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");

  // Build where clause based on filters
  const where: any = {};
  
  if (itemId) {
    where.itemId = itemId;
  }

  const audits = await prisma.audit.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { 
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        }
      }, 
      item: {
        select: {
          id: true,
          title: true,
          status: true,
        }
      } 
    },
  });
  
  return NextResponse.json(audits);
}
