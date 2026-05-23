export const dynamic = "force-dynamic";
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, upiId } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // ── Check duplicate ──
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // ── Hash + create ──
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        upiId: upiId || null,
      },
    });

    // ── Sign JWT ──
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = {
      id:           user.id,
      fullName:     user.fullName,
      email:        user.email,
      upiId:        user.upiId,
      profileImage: user.profileImage,
    };

    const response = NextResponse.json(
      { user: safeUser, token },
      { status: 201 }
    );

    response.cookies.set("simplify_token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   60 * 60 * 24 * 7,
      path:     "/",
    });

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
