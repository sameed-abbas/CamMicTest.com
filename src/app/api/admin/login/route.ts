import { NextRequest, NextResponse } from "next/server";
import { readDb, verifyPassword, writeDb } from "@/lib/db";
import { generateSecret } from "@/lib/totp";
import QRCode from "qrcode";

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

    // If 2FA is fully enabled, route to verification challenge screen
    if (db.admin.twoFactorEnabled) {
      return NextResponse.json({ success: true, step: "otp" });
    }

    // If 2FA is not enabled yet, setup is required
    let secret = db.admin.twoFactorSecret;
    if (!secret) {
      secret = generateSecret();
      db.admin.twoFactorSecret = secret;
      db.admin.twoFactorEnabled = false;
      await writeDb(db);
    }

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
      secret: secret.match(/.{1,4}/g)?.join(" ") || secret, // formats secret key with spaces for readability (e.g. ABCD EFGH)
      qrCode: qrCodeDataUrl
    });

  } catch (e) {
    console.error("Login API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
