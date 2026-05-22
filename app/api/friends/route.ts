// app/api/friends/route.ts
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

// GET /api/friends — list friends with balances
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const friendships = await db.friendship.findMany({
      where: {
        OR: [
          { senderId: userId,   status: "accepted" },
          { receiverId: userId, status: "accepted" },
        ],
      },
      include: {
        sender:   { select: { id: true, fullName: true, email: true, upiId: true, profileImage: true } },
        receiver: { select: { id: true, fullName: true, email: true, upiId: true, profileImage: true } },
      },
    });

    // For each friend, calculate net balance
    const friends = await Promise.all(
      friendships.map(async (f) => {
        const friend = f.senderId === userId ? f.receiver : f.sender;

        // What friend owes user (friend paid nothing, user paid)
        const theyOweMe = await db.expenseParticipant.aggregate({
          _sum: { owedAmount: true },
          where: {
            userId:  friend.id,
            expense: { paidById: userId },
          },
        });

        // What user owes friend
        const iOweThem = await db.expenseParticipant.aggregate({
          _sum: { owedAmount: true },
          where: {
            userId,
            expense: { paidById: friend.id },
          },
        });

        // Settlements between them
        const settledByFriend = await db.settlement.aggregate({
          _sum: { amount: true },
          where: { payerId: friend.id, receiverId: userId },
        });

        const settledByMe = await db.settlement.aggregate({
          _sum: { amount: true },
          where: { payerId: userId, receiverId: friend.id },
        });

        const balance =
          (theyOweMe._sum.owedAmount ?? 0) -
          (iOweThem._sum.owedAmount ?? 0) +
          (settledByFriend._sum.amount ?? 0) -
          (settledByMe._sum.amount ?? 0);

        const initials = friend.fullName
          .split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

        return {
          id:           friend.id,
          name:         friend.fullName,
          email:        friend.email,
          upiId:        friend.upiId,
          initials,
          balance:      parseFloat(balance.toFixed(2)),
          friendshipId: f.id,
        };
      })
    );

    // Also get pending requests received
    const pendingRequests = await db.friendship.findMany({
      where: { receiverId: userId, status: "pending" },
      include: {
        sender: { select: { id: true, fullName: true, email: true } },
      },
    });

    return NextResponse.json({ friends, pendingRequests }, { status: 200 });
  } catch (err) {
    console.error("GET /api/friends error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

// POST /api/friends — send friend request by email
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ message: "Email is required." }, { status: 400 });

    const target = await db.user.findUnique({ where: { email } });
    if (!target) return NextResponse.json({ message: "No user found with that email." }, { status: 404 });
    if (target.id === userId) return NextResponse.json({ message: "You can't add yourself." }, { status: 400 });

    // Check existing
    const existing = await db.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId,    receiverId: target.id },
          { senderId: target.id, receiverId: userId },
        ],
      },
    });

    if (existing) {
      const msg = existing.status === "accepted"
        ? "You are already friends."
        : "Friend request already sent.";
      return NextResponse.json({ message: msg }, { status: 409 });
    }

    const friendship = await db.friendship.create({
      data: { senderId: userId, receiverId: target.id, status: "pending" },
    });

    return NextResponse.json({ friendship }, { status: 201 });
  } catch (err) {
    console.error("POST /api/friends error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

// PATCH /api/friends — accept or reject a request
export async function PATCH(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { friendshipId, action } = await req.json();
    if (!friendshipId || !action) return NextResponse.json({ message: "Missing fields." }, { status: 400 });

    const friendship = await db.friendship.findUnique({ where: { id: friendshipId } });
    if (!friendship || friendship.receiverId !== userId) {
      return NextResponse.json({ message: "Not found." }, { status: 404 });
    }

    const updated = await db.friendship.update({
      where:  { id: friendshipId },
      data:   { status: action === "accept" ? "accepted" : "rejected" },
    });

    return NextResponse.json({ friendship: updated }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/friends error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}