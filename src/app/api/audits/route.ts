import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const audits = await prisma.audit.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, item: true },
  });
  return NextResponse.json(audits);
}
