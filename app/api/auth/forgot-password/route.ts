export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: "If this email exists, a reset link has been sent." },
        { status: 200 }
      );
    }

    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token     = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Simplify 💸" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset your Simplify password",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
          <h2 style="color:#FF4F79;margin-bottom:8px">Reset your password</h2>
          <p style="color:#444;margin-bottom:24px">
            Click the button below to reset your Simplify password.
            This link expires in <strong>15 minutes</strong>.
          </p>
          <a href="${resetUrl}"
            style="background:#FF4F79;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:600">
            Reset Password
          </a>
          <p style="color:#888;font-size:12px;margin-top:32px">
            If you didn't request this, you can safely ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
          <p style="color:#aaa;font-size:11px">Simplify · Split bills. Not friendships.</p>
        </div>
      `,
    });

    console.log("[EMAIL SENT] Reset link sent to:", email);

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