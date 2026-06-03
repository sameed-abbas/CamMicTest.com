import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { verifyTOTP } from "@/lib/totp";
import { establishSession } from "@/lib/auth";
import crypto from "crypto";

function parseUserAgent(userAgent: string) {
  let browser = "Unknown Browser";
  let device = "Desktop";

  if (/chrome|crios/i.test(userAgent) && !/edge|edg/i.test(userAgent)) {
    browser = "Google Chrome";
  } else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) {
    browser = "Apple Safari";
  } else if (/firefox|fxios/i.test(userAgent)) {
    browser = "Mozilla Firefox";
  } else if (/edge|edg/i.test(userAgent)) {
    browser = "Microsoft Edge";
  }

  if (/mobile/i.test(userAgent)) {
    device = "Mobile";
  } else if (/tablet|ipad/i.test(userAgent)) {
    device = "Tablet";
  }

  return { browser, device };
}

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
    const now = new Date().toISOString();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || (request as any).ip || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "";
    const { browser, device } = parseUserAgent(userAgent);

    if (!isValid) {
      // Log failed OTP attempt
      db.loginHistory.push({
        id: crypto.randomUUID(),
        username,
        timestamp: now,
        ip,
        device,
        browser,
        status: "failed"
      });
      await writeDb(db);
      return NextResponse.json({ error: "Invalid verification code. Please check your authenticator app." }, { status: 400 });
    }

    const wasAlreadyEnabled = db.admin.twoFactorEnabled;

    // On first successful validation, mark 2FA as fully enabled and registered
    if (!db.admin.twoFactorEnabled) {
      db.admin.twoFactorEnabled = true;
      console.log(`🔒 [SECURITY] Two-factor authentication (TOTP) successfully enabled for user ${username}`);
    }

    // Log successful login history
    db.loginHistory.push({
      id: crypto.randomUUID(),
      username,
      timestamp: now,
      ip,
      device,
      browser,
      status: "success"
    });

    // Add audit log
    db.auditLogs.push({
      id: crypto.randomUUID(),
      username,
      action: wasAlreadyEnabled ? "login" : "two_factor_enable",
      details: wasAlreadyEnabled
        ? "Logged in successfully via Google Authenticator TOTP."
        : "Enabled Google Authenticator Two-Factor settings (TOTP) and logged in.",
      timestamp: now,
      ip,
      device
    });

    await writeDb(db);

    // Establish secure HttpOnly cookie session with metadata
    await establishSession(username, ip, device, browser);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("OTP Verification API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
