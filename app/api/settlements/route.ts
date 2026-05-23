export const dynamic = "force-dynamic";
// app/api/settlements/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET!;

function getUserId(req: NextRequest): string | null {
  try {
    const token = req.cookies.get("simplify_token")?.value;
    if (!token) return null;
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return payload.userId;
  } catch { return null; }
}

// POST /api/settlements — record a payment
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { receiverId, amount, method, note, groupId } = await req.json();

    if (!receiverId) return NextResponse.json({ message: "Receiver is required." }, { status: 400 });
    if (!amount || amount <= 0) return NextResponse.json({ message: "Amount must be greater than 0." }, { status: 400 });

    const settlement = await db.settlement.create({
      data: {
        payerId:    userId,
        receiverId,
        amount:     parseFloat(amount),
        method:     method || "cash",
        note:       note || null,
        groupId:    groupId || null,
      },
      include: {
        payer:    { select: { id: true, fullName: true } },
        receiver: { select: { id: true, fullName: true } },
      },
    });

    // Create notification for receiver
    await db.notification.create({
      data: {
        userId:  receiverId,
        title:   "Payment received",
        body:    `${settlement.payer.fullName} paid you ₹${amount} via ${method || "cash"}`,
        type:    "payment",
      },
    });

    return NextResponse.json({ settlement }, { status: 201 });
  } catch (err) {
    console.error("POST /api/settlements error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
