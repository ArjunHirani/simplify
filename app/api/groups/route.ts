export const dynamic = "force-dynamic";
// app/api/groups/route.ts
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
  } catch {
    return null;
  }
}

// GET /api/groups — list all groups for current user
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const memberships = await db.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            members: { include: { user: { select: { id: true, fullName: true, profileImage: true } } } },
            expenses: {
              include: { participants: true },
            },
          },
        },
      },
    });

    const groups = memberships.map(({ group }) => {
      // Calculate net balance for current user in this group
      let netBalance = 0;
      group.expenses.forEach((expense) => {
        if (expense.paidById === userId) {
          // User paid — others owe them
          const totalOwed = expense.participants
            .filter((p) => p.userId !== userId)
            .reduce((sum, p) => sum + p.owedAmount, 0);
          netBalance += totalOwed;
        }
        const myShare = expense.participants.find((p) => p.userId === userId);
        if (myShare && expense.paidById !== userId) {
          netBalance -= myShare.owedAmount;
        }
      });

      const totalSpent = group.expenses.reduce((sum, e) => sum + e.amount, 0);
      const myShare = group.expenses.reduce((sum, e) => {
        const part = e.participants.find((p) => p.userId === userId);
        return sum + (part?.owedAmount ?? 0);
      }, 0);

      return {
        id:          group.id,
        name:        group.name,
        emoji:       group.emoji,
        description: group.description,
        members:     group.members.length,
        memberList:  group.members.map((m) => ({
          id:           m.user.id,
          fullName:     m.user.fullName,
          profileImage: m.user.profileImage,
          role:         m.role,
        })),
        totalSpent,
        yourShare:  myShare,
        netBalance,
        currency:   group.currency,
      };
    });

    return NextResponse.json({ groups }, { status: 200 });
  } catch (err) {
    console.error("GET /api/groups error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

// POST /api/groups — create a new group
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { name, emoji, description, memberEmails } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ message: "Group name is required." }, { status: 400 });
    }

    // Find members by email
    const memberUsers = memberEmails?.length
      ? await db.user.findMany({ where: { email: { in: memberEmails } } })
      : [];

    const memberIds = [
      userId,
      ...memberUsers.map((u: { id: string }) => u.id).filter((id: string) => id !== userId),
    ];

    const group = await db.group.create({
      data: {
        name:        name.trim(),
        emoji:       emoji || "👥",
        description: description || null,
        createdById: userId,
        members: {
          create: memberIds.map((id: string) => ({
            userId: id,
            role:   id === userId ? "admin" : "member",
          })),
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (err) {
    console.error("POST /api/groups error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
