// app/api/expenses/route.ts
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

// POST /api/expenses
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const {
      title,
      amount,
      groupId,
      category,
      splitType,
      notes,
      date,
      splits,
      selectedMemberIds, // ← which members to split with (from frontend)
    } = await req.json();

    if (!title?.trim()) return NextResponse.json({ message: "Title is required." }, { status: 400 });
    if (!amount || amount <= 0) return NextResponse.json({ message: "Amount must be greater than 0." }, { status: 400 });

    // ── Determine participant IDs ──
    let participantIds: string[] = [];

    if (selectedMemberIds && selectedMemberIds.length > 0) {
      // Use the member selection from the frontend
      participantIds = selectedMemberIds;
      // Always include the payer if not already included
      if (!participantIds.includes(userId)) participantIds.push(userId);
    } else if (groupId) {
      // Fall back to all group members
      const members = await db.groupMember.findMany({ where: { groupId } });
      participantIds = members.map((m: { userId: string }) => m.userId);
    } else {
      participantIds = [userId];
    }

    // ── Calculate split amounts ──
    const participants = calculateSplit({
      splitType: splitType || "equal",
      amount: parseFloat(amount),
      participantIds,
      paidById: userId,
      splits,
    });

    const expense = await db.expense.create({
      data: {
        title:     title.trim(),
        amount:    parseFloat(amount),
        category:  category || "General",
        splitType: splitType || "equal",
        notes:     notes || null,
        date:      date ? new Date(date) : new Date(),
        groupId:   groupId || null,
        paidById:  userId,
        participants: { create: participants },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, fullName: true } } },
        },
        paidBy: { select: { id: true, fullName: true } },
      },
    });

    // ── Create notifications for other participants ──
    const otherParticipants = participants.filter(p => p.userId !== userId);
    if (otherParticipants.length > 0) {
      await db.notification.createMany({
        data: otherParticipants.map(p => ({
          userId:  p.userId,
          title:   "New expense added",
          body:    `${expense.paidBy.fullName} added "${title}" — you owe ₹${p.owedAmount.toFixed(0)}`,
          type:    "expense",
        })),
      });
    }

    return NextResponse.json({ expense }, { status: 201 });
  } catch (err) {
    console.error("POST /api/expenses error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

// GET /api/expenses
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    const expenses = await db.expense.findMany({
      where: {
        OR: [
          { paidById: userId },
          { participants: { some: { userId } } },
        ],
        ...(groupId ? { groupId } : {}),
      },
      include: {
        paidBy:       { select: { id: true, fullName: true } },
        participants: { include: { user: { select: { id: true, fullName: true } } } },
        group:        { select: { id: true, name: true, emoji: true } },
      },
      orderBy: { date: "desc" },
      take: 50,
    });

    return NextResponse.json({ expenses }, { status: 200 });
  } catch (err) {
    console.error("GET /api/expenses error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

// ── Split calculation ──
function calculateSplit({
  splitType, amount, participantIds, paidById, splits,
}: {
  splitType: string;
  amount: number;
  participantIds: string[];
  paidById: string;
  splits?: Record<string, number>;
}) {
  switch (splitType) {
    case "equal": {
      const share = parseFloat((amount / participantIds.length).toFixed(2));
      const last  = parseFloat((amount - share * (participantIds.length - 1)).toFixed(2));
      return participantIds.map((userId, i) => ({
        userId,
        owedAmount: i === participantIds.length - 1 ? last : share,
        paidAmount: userId === paidById ? amount : 0,
      }));
    }
    case "exact": {
      return participantIds.map(userId => ({
        userId,
        owedAmount: parseFloat((splits?.[userId] ?? 0).toFixed(2)),
        paidAmount: userId === paidById ? amount : 0,
      }));
    }
    case "percentage": {
      return participantIds.map(userId => ({
        userId,
        owedAmount: parseFloat(((amount * (splits?.[userId] ?? 0)) / 100).toFixed(2)),
        paidAmount: userId === paidById ? amount : 0,
      }));
    }
    default:
      return participantIds.map(userId => ({
        userId,
        owedAmount: parseFloat((amount / participantIds.length).toFixed(2)),
        paidAmount: userId === paidById ? amount : 0,
      }));
  }
}