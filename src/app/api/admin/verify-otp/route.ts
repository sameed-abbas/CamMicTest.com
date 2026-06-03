import { NextRequest, NextResponse } from "next/server";
import { verifyOTPCode, establishSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, otp } = await request.json();

    if (!username || !otp) {
      return NextResponse.json({ error: "Username and verification code are required" }, { status: 400 });
    }

    const isValid = await verifyOTPCode(username, otp);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    // Establish dynamic HttpOnly session cookie
    await establishSession(username);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("OTP Verification API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
