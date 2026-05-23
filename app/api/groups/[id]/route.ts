// app/api/groups/[id]/route.ts
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

// GET /api/groups/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const group = await db.group.findUnique({
      where: { id: id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, upiId: true, profileImage: true },
            },
          },
        },
        expenses: {
          include: {
            paidBy:       { select: { id: true, fullName: true } },
            participants: { include: { user: { select: { id: true, fullName: true } } } },
          },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!group) return NextResponse.json({ message: "Group not found." }, { status: 404 });

    // Check user is a member
    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) return NextResponse.json({ message: "Access denied." }, { status: 403 });

    // ── Calculate per-member balances ──
    const memberBalances: Record<string, number> = {};
    group.members.forEach((m) => { memberBalances[m.userId] = 0; });

    group.expenses.forEach((expense) => {
      // Person who paid gets credit for everyone else's share
      expense.participants.forEach((p) => {
        if (p.userId !== expense.paidById) {
          memberBalances[expense.paidById] = (memberBalances[expense.paidById] ?? 0) + p.owedAmount;
          memberBalances[p.userId] = (memberBalances[p.userId] ?? 0) - p.owedAmount;
        }
      });
    });

    // ── Apply settlements ──
    const settlements = await db.settlement.findMany({
      where: { groupId: id },
    });
    settlements.forEach((s) => {
      memberBalances[s.receiverId] = (memberBalances[s.receiverId] ?? 0) - s.amount;
      memberBalances[s.payerId]    = (memberBalances[s.payerId]    ?? 0) + s.amount;
    });

    const totalSpent   = group.expenses.reduce((sum, e) => sum + e.amount, 0);
    const myShare      = group.expenses.reduce((sum, e) => {
      const part = e.participants.find((p) => p.userId === userId);
      return sum + (part?.owedAmount ?? 0);
    }, 0);

    const membersWithBalances = group.members.map((m) => ({
      id:           m.user.id,
      fullName:     m.user.fullName,
      email:        m.user.email,
      upiId:        m.user.upiId,
      role:         m.role,
      balance:      parseFloat((memberBalances[m.userId] ?? 0).toFixed(2)),
    }));

    return NextResponse.json({
      group: {
        id:          group.id,
        name:        group.name,
        emoji:       group.emoji,
        description: group.description,
        currency:    group.currency,
        createdById: group.createdById,
        totalSpent,
        myShare,
        myBalance:   parseFloat((memberBalances[userId] ?? 0).toFixed(2)),
        members:     membersWithBalances,
        expenses:    group.expenses.map((e) => ({
          id:          e.id,
          title:       e.title,
          amount:      e.amount,
          category:    e.category,
          splitType:   e.splitType,
          date:        e.date,
          paidBy:      e.paidBy,
          myShare:     e.participants.find((p) => p.userId === userId)?.owedAmount ?? 0,
          participants: e.participants.map((p) => ({
            userId:    p.userId,
            name:      p.user.fullName,
            owed:      p.owedAmount,
            paid:      p.paidAmount,
          })),
        })),
      },
    }, { status: 200 });
  } catch (err) {
    console.error("GET /api/groups/[id] error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

// DELETE /api/groups/[id] — leave or delete group
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const member = await db.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId } },
    });
    if (!member) return NextResponse.json({ message: "Not a member." }, { status: 403 });

    if (member.role === "admin") {
      // Admin deletes the whole group
      await db.group.delete({ where: { id: id } });
      return NextResponse.json({ message: "Group deleted." }, { status: 200 });
    } else {
      // Member just leaves
      await db.groupMember.delete({
        where: { groupId_userId: { groupId: id, userId } },
      });
      return NextResponse.json({ message: "Left group." }, { status: 200 });
    }
  } catch (err) {
    console.error("DELETE /api/groups/[id] error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}