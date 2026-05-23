export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out." }, { status: 200 });
  response.cookies.delete("simplify_token");
  return response;
}
