import { NextRequest, NextResponse } from "next/server";
import { readDb, verifyPassword } from "@/lib/db";
import { createAndSendOTP } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const db = await readDb();

    // Validate credentials
    if (db.admin.username !== username || !verifyPassword(password, db.admin.passwordHash)) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Trigger OTP sending
    await createAndSendOTP(username);

    return NextResponse.json({ success: true, step: "otp" });
  } catch (e) {
    console.error("Login API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
