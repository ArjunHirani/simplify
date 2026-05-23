export const dynamic = "force-dynamic";
// app/api/activity/route.ts
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

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  === 1) return "Yesterday";
  if (days  < 7)   return `${days} days ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const CATEGORY_EMOJI: Record<string, string> = {
  Food:       "🍕",
  Travel:     "✈️",
  Utilities:  "💡",
  Groceries:  "🛒",
  Shopping:   "🛍️",
  Entertainment: "🎬",
  Health:     "💊",
  General:    "📋",
};

// GET /api/activity
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all"; // all | expense | settlement

    const activities: object[] = [];

    // ── Expenses ──
    if (filter === "all" || filter === "expense") {
      const expenses = await db.expense.findMany({
        where: {
          OR: [
            { paidById: userId },
            { participants: { some: { userId } } },
          ],
        },
        include: {
          paidBy:       { select: { id: true, fullName: true } },
          group:        { select: { id: true, name: true } },
          participants: { where: { userId } },
        },
        orderBy: { date: "desc" },
        take: 30,
      });

      expenses.forEach((expense) => {
        const myShare    = expense.participants[0]?.owedAmount ?? 0;
        const iPaid      = expense.paidById === userId;
        const amount     = iPaid
          ? expense.amount - myShare  // net positive: others owe me
          : -myShare;                  // net negative: I owe

        activities.push({
          id:          `expense-${expense.id}`,
          type:        "expense",
          emoji:       CATEGORY_EMOJI[expense.category] ?? "📋",
          emojiColor:  iPaid ? "rgba(74,222,128,0.12)" : "rgba(255,107,107,0.1)",
          title:       expense.title,
          description: `${expense.paidBy.fullName} paid${expense.group ? ` · ${expense.group.name}` : ""} · ${expense.splitType} split`,
          amount,
          timestamp:   timeAgo(expense.date),
          date:        expense.date,
        });
      });
    }

    // ── Settlements ──
    if (filter === "all" || filter === "settlement") {
      const settlements = await db.settlement.findMany({
        where: {
          OR: [
            { payerId: userId },
            { receiverId: userId },
          ],
        },
        include: {
          payer:    { select: { id: true, fullName: true } },
          receiver: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      settlements.forEach((s) => {
        const received = s.receiverId === userId;
        activities.push({
          id:          `settlement-${s.id}`,
          type:        "settlement",
          emoji:       "✅",
          emojiColor:  "rgba(74,222,128,0.12)",
          title:       received ? "Payment received" : "Payment sent",
          description: received
            ? `${s.payer.fullName} paid you via ${s.method}`
            : `You paid ${s.receiver.fullName} via ${s.method}`,
          amount:      received ? s.amount : -s.amount,
          timestamp:   timeAgo(s.createdAt),
          date:        s.createdAt,
        });
      });
    }

    // Sort all by date desc
    activities.sort((a: any, b: any) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({ activities: activities.slice(0, 30) }, { status: 200 });
  } catch (err) {
    console.error("GET /api/activity error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
