export const dynamic = "force-dynamic";
// app/api/dashboard/route.ts
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

// GET /api/dashboard — summary stats for current user
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    // Total others owe me (I paid, others share)
    const expensesPaidByMe = await db.expense.findMany({
      where: { paidById: userId },
      include: { participants: true },
    });

    let totalOwed = 0;
    expensesPaidByMe.forEach((e) => {
      e.participants
        .filter((p) => p.userId !== userId)
        .forEach((p) => { totalOwed += p.owedAmount; });
    });

    // Total I owe others
    const myShares = await db.expenseParticipant.findMany({
      where: {
        userId,
        expense: { paidById: { not: userId } },
      },
    });
    let totalOwing = myShares.reduce((sum, p) => sum + p.owedAmount, 0);

    // Subtract settlements
    const settledByOthers = await db.settlement.aggregate({
      _sum: { amount: true },
      where: { receiverId: userId },
    });
    const settledByMe = await db.settlement.aggregate({
      _sum: { amount: true },
      where: { payerId: userId },
    });

    totalOwed  -= (settledByOthers._sum.amount ?? 0);
    totalOwing -= (settledByMe._sum.amount ?? 0);

    // This month's total shared
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyExpenses = await db.expenseParticipant.findMany({
      where: {
        userId,
        expense: { date: { gte: startOfMonth } },
      },
    });
    const monthlyShared = monthlyExpenses.reduce((sum, p) => sum + p.owedAmount, 0);

    return NextResponse.json({
      summary: {
        totalOwed:     parseFloat(Math.max(0, totalOwed).toFixed(2)),
        totalOwing:    parseFloat(Math.max(0, totalOwing).toFixed(2)),
        monthlyShared: parseFloat(monthlyShared.toFixed(2)),
      },
    }, { status: 200 });
  } catch (err) {
    console.error("GET /api/dashboard error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
