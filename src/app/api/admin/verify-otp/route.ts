import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { verifyTOTP } from "@/lib/totp";
import { establishSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, otp } = await request.json();

    if (!username || !otp) {
      return NextResponse.json({ error: "Username and verification code are required" }, { status: 400 });
    }

    const db = await readDb();

    if (db.admin.username !== username) {
      return NextResponse.json({ error: "Unauthorized access attempt" }, { status: 401 });
    }

    const secret = db.admin.twoFactorSecret;
    if (!secret) {
      return NextResponse.json({ error: "Two-factor authentication not initialized" }, { status: 400 });
    }

    // Verify 6-digit TOTP code with clock-skew tolerance (window = 1, i.e. checking current +/- 30s)
    const isValid = verifyTOTP(secret, otp, 1);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid verification code. Please check your authenticator app." }, { status: 400 });
    }

    // On first successful validation, mark 2FA as fully enabled and registered
    if (!db.admin.twoFactorEnabled) {
      db.admin.twoFactorEnabled = true;
      await writeDb(db);
      console.log(`🔒 [SECURITY] Two-factor authentication (TOTP) successfully enabled for user ${username}`);
    }

    // Establish secure HttpOnly cookie session
    await establishSession(username);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("OTP Verification API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
