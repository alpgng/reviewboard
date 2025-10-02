import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";


const THRESHOLD = 70; // risk >= 70 ise high-risk tagı


export async function GET(req: Request) {
const auth = req.headers.get("authorization");
if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}


const items = await prisma.item.findMany({ where: { risk_score: { gte: THRESHOLD } } });
let tagged = 0;


for (const it of items) {
if (!it.tags.includes("high-risk")) {
const tags = [...it.tags, "high-risk"];
await prisma.item.update({ where: { id: it.id }, data: { tags } });
await prisma.audit.create({
data: { action: "Auto-tag: high-risk", userId: it.userId, itemId: it.id },
});
tagged++;
}
}


return NextResponse.json({ ok: true, tagged });
}