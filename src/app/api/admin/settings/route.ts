import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, verifyPassword, hashPassword } from "@/lib/db";
import { getActiveSession } from "@/lib/auth";
import crypto from "crypto";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function GET(request: NextRequest) {
  try {
    const session = await getActiveSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await readDb();

    // Map active sessions, hiding actual raw tokens for security and marking the current session
    const activeSessions = db.sessions.map((s) => {
      const tokenHash = hashToken(s.token);
      return {
        tokenHash,
        ip: s.ip || "127.0.0.1",
        device: s.device || "Unknown Device",
        browser: s.browser || "Unknown Browser",
        createdAt: s.createdAt || s.expiresAt,
        isCurrent: s.token === session.token
      };
    });

    return NextResponse.json({
      admin: {
        name: db.admin.name || "Sameed Abbas",
        username: db.admin.username,
        profilePhoto: db.admin.profilePhoto || "/logo-white.png",
        emailVerified: db.admin.emailVerified !== false,
        twoFactorEnabled: db.admin.twoFactorEnabled === true
      },
      activeSessions,
      loginHistory: (db.loginHistory || []).slice(-50).reverse(),
      auditLogs: (db.auditLogs || []).slice(-100).reverse(),
      securityAlerts: (db.securityAlerts || []).filter((a) => !a.resolved)
    });
  } catch (e) {
    console.error("GET admin settings error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getActiveSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;
    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    const db = await readDb();
    const now = new Date().toISOString();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || (request as any).ip || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "";
    
    // Parse device from userAgent
    let device = "Desktop";
    if (/mobile/i.test(userAgent)) device = "Mobile";
    else if (/tablet/i.test(userAgent)) device = "Tablet";

    if (action === "update_profile") {
      const { name, username, profilePhoto } = body;
      if (!name || !username) {
        return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
      }

      // Check email format
      if (!/\S+@\S+\.\S+/.test(username)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
      }

      // Track old profile for audit trail
      const oldName = db.admin.name;
      const oldEmail = db.admin.username;

      db.admin.name = name;
      db.admin.username = username;
      if (profilePhoto !== undefined) {
        db.admin.profilePhoto = profilePhoto;
      }

      // If email changed, we update all current sessions to avoid validation mismatch
      if (oldEmail !== username) {
        db.sessions = db.sessions.map((s) => s.username === oldEmail ? { ...s, username } : s);
      }

      // Add audit log
      db.auditLogs.push({
        id: crypto.randomUUID(),
        username: session.username,
        action: "settings_update",
        details: `Updated profile details: Name changed from "${oldName}" to "${name}", Email from "${oldEmail}" to "${username}".`,
        timestamp: now,
        ip,
        device
      });

      await writeDb(db);
      return NextResponse.json({ success: true });
    }

    if (action === "change_password") {
      const { oldPassword, newPassword } = body;
      if (!oldPassword || !newPassword) {
        return NextResponse.json({ error: "Current and New passwords are required" }, { status: 400 });
      }

      // Verify current password
      if (!verifyPassword(oldPassword, db.admin.passwordHash)) {
        return NextResponse.json({ error: "Current password verification failed" }, { status: 400 });
      }

      // Minimum strength check: length >= 8
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 });
      }

      // Save new password
      db.admin.passwordHash = hashPassword(newPassword);

      // Log alert
      db.securityAlerts.push({
        id: crypto.randomUUID(),
        type: "password_change",
        message: "Administrator password changed successfully",
        timestamp: now,
        ip,
        device,
        resolved: false
      });

      // Clear other active sessions for security
      db.sessions = db.sessions.filter((s) => s.token === session.token);

      // Add audit log
      db.auditLogs.push({
        id: crypto.randomUUID(),
        username: session.username,
        action: "password_change",
        details: "Changed administrator security password and revoked all other active sessions.",
        timestamp: now,
        ip,
        device
      });

      await writeDb(db);
      return NextResponse.json({ success: true });
    }

    if (action === "reset_2fa") {
      const { password } = body;
      if (!password) {
        return NextResponse.json({ error: "Password verification is required to disable 2FA" }, { status: 400 });
      }

      // Verify current password
      if (!verifyPassword(password, db.admin.passwordHash)) {
        return NextResponse.json({ error: "Password verification failed" }, { status: 400 });
      }

      db.admin.twoFactorSecret = undefined;
      db.admin.twoFactorEnabled = false;

      // Log alert
      db.securityAlerts.push({
        id: crypto.randomUUID(),
        type: "two_factor_toggle",
        message: "Two-factor authentication (2FA) was deactivated",
        timestamp: now,
        ip,
        device,
        resolved: false
      });

      // Add audit log
      db.auditLogs.push({
        id: crypto.randomUUID(),
        username: session.username,
        action: "two_factor_disable",
        details: "Deactivated Google Authenticator Two-Factor settings.",
        timestamp: now,
        ip,
        device
      });

      await writeDb(db);
      return NextResponse.json({ success: true });
    }

    if (action === "dismiss_alert") {
      const { alertId } = body;
      if (!alertId) {
        return NextResponse.json({ error: "Alert ID is required" }, { status: 400 });
      }

      db.securityAlerts = db.securityAlerts.map((a) =>
        a.id === alertId ? { ...a, resolved: true } : a
      );

      // Add audit log
      db.auditLogs.push({
        id: crypto.randomUUID(),
        username: session.username,
        action: "alert_dismiss",
        details: `Dismissed security warning alert ID: ${alertId}`,
        timestamp: now,
        ip,
        device
      });

      await writeDb(db);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (e) {
    console.error("POST admin settings error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getActiveSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tokenHash = searchParams.get("tokenHash");
    const all = searchParams.get("all") === "true";

    if (!tokenHash && !all) {
      return NextResponse.json({ error: "tokenHash or all parameter is required" }, { status: 400 });
    }

    const db = await readDb();
    const now = new Date().toISOString();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || (request as any).ip || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "";
    
    // Parse device from userAgent
    let device = "Desktop";
    if (/mobile/i.test(userAgent)) device = "Mobile";
    else if (/tablet/i.test(userAgent)) device = "Tablet";

    if (all) {
      // Revoke all sessions EXCEPT the current one
      const prevCount = db.sessions.length;
      db.sessions = db.sessions.filter((s) => s.token === session.token);

      // Add audit log
      db.auditLogs.push({
        id: crypto.randomUUID(),
        username: session.username,
        action: "session_revoke_all",
        details: `Revoked all other active sessions (${prevCount - 1} session(s) closed).`,
        timestamp: now,
        ip,
        device
      });
    } else if (tokenHash) {
      // Find the session info for audit details
      const targetSession = db.sessions.find((s) => hashToken(s.token) === tokenHash);
      if (!targetSession) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      // Filter it out
      db.sessions = db.sessions.filter((s) => hashToken(s.token) !== tokenHash);

      // Add audit log
      db.auditLogs.push({
        id: crypto.randomUUID(),
        username: session.username,
        action: "session_revoke",
        details: `Revoked session on device "${targetSession.device || "Unknown"}" running browser "${targetSession.browser || "Unknown"}" from IP ${targetSession.ip || "Unknown"}.`,
        timestamp: now,
        ip,
        device
      });
    }

    await writeDb(db);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE admin settings error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
