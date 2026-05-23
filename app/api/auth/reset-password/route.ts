export const dynamic = "force-dynamic";
// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: "Token and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // ── Find token in DB ──
    const resetRecord = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { message: "Reset link is invalid or has already been used." },
        { status: 400 }
      );
    }

    // ── Check expiry ──
    if (resetRecord.expiresAt < new Date()) {
      await db.passwordResetToken.delete({ where: { token } });
      return NextResponse.json(
        { message: "Reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // ── Hash new password ──
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // ── Update user password in DB ──
    await db.user.update({
      where: { id: resetRecord.userId },
      data:  { passwordHash },
    });

    // ── Delete used token ──
    await db.passwordResetToken.delete({ where: { token } });

    return NextResponse.json(
      { message: "Password reset successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
