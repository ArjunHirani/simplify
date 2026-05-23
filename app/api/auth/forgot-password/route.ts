export const dynamic = "force-dynamic";
// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

    // Always return 200 even if user not found — prevents email enumeration
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: "If this email exists, a reset link has been sent." },
        { status: 200 }
      );
    }

    // ── Delete any existing tokens for this user ──
    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });

    // ── Generate new token ──
    const token     = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // ── Save token to DB ──
    await db.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    // DEV: log reset URL in terminal (replace with real email later)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("[DEV] Password reset URL:");
    console.log(resetUrl);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // TODO: send real email with Resend/SendGrid
    // await sendEmail({ to: email, subject: "Reset your Simplify password", html: `<a href="${resetUrl}">Reset Password</a>` });

    return NextResponse.json(
      { message: "If this email exists, a reset link has been sent." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
