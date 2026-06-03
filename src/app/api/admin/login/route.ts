import { NextRequest, NextResponse } from "next/server";
import { readDb, verifyPassword, writeDb } from "@/lib/db";
import { generateSecret } from "@/lib/totp";
import QRCode from "qrcode";
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
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const db = await readDb();
    const now = new Date().toISOString();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || (request as any).ip || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "";
    const { browser, device } = parseUserAgent(userAgent);

    // Validate credentials
    if (db.admin.username !== username || !verifyPassword(password, db.admin.passwordHash)) {
      // Log failed login history
      db.loginHistory.push({
        id: crypto.randomUUID(),
        username: username.substring(0, 100),
        timestamp: now,
        ip,
        device,
        browser,
        status: "failed"
      });

      // Check for consecutive failures from this IP in the last 15 minutes
      const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
      const recentFailures = db.loginHistory.filter(
        (h) => h.ip === ip && h.status === "failed" && new Date(h.timestamp).getTime() > fifteenMinsAgo
      );

      if (recentFailures.length >= 3) {
        const activeAlert = db.securityAlerts.find(
          (a) => a.type === "failed_login" && a.ip === ip && !a.resolved
        );
        if (!activeAlert) {
          db.securityAlerts.push({
            id: crypto.randomUUID(),
            type: "failed_login",
            message: `Multiple failed login attempts (${recentFailures.length}) detected in 15 minutes.`,
            timestamp: now,
            ip,
            device,
            resolved: false
          });
        }
      }

      await writeDb(db);
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Log pending 2FA step verification
    db.loginHistory.push({
      id: crypto.randomUUID(),
      username,
      timestamp: now,
      ip,
      device,
      browser,
      status: "otp_pending"
    });

    // Check if logging in from a new IP compared to past successes
    const hasPreviousSuccess = db.loginHistory.some((h) => h.status === "success" && h.username === username);
    const isNewIp = hasPreviousSuccess && !db.loginHistory.some((h) => h.status === "success" && h.ip === ip && h.username === username);

    if (isNewIp) {
      const activeAlert = db.securityAlerts.find(
        (a) => a.type === "suspicious_login" && a.ip === ip && !a.resolved
      );
      if (!activeAlert) {
        db.securityAlerts.push({
          id: crypto.randomUUID(),
          type: "suspicious_login",
          message: `Administrative credentials verified from a new IP address: ${ip}`,
          timestamp: now,
          ip,
          device,
          resolved: false
        });
      }
    }

    // If 2FA is fully enabled, route to verification challenge screen
    if (db.admin.twoFactorEnabled) {
      await writeDb(db);
      return NextResponse.json({ success: true, step: "otp" });
    }

    // If 2FA is not enabled yet, setup is required
    let secret = db.admin.twoFactorSecret;
    if (!secret) {
      secret = generateSecret();
      db.admin.twoFactorSecret = secret;
      db.admin.twoFactorEnabled = false;
    }

    await writeDb(db);

    // Generate standard otpauth URL
    const issuer = "CamMicTest.com";
    const otpauthUrl = `otpauth://totp/${issuer}:${username}?secret=${secret}&issuer=${issuer}`;

    // Convert standard URI into a local Base64 QR code image Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      margin: 1,
      width: 240,
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    });

    return NextResponse.json({
      success: true,
      step: "setup",
      secret: secret.match(/.{1,4}/g)?.join(" ") || secret,
      qrCode: qrCodeDataUrl
    });

  } catch (e) {
    console.error("Login API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
