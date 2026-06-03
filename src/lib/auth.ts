import { cookies } from "next/headers";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { readDb, writeDb, Session } from "./db";

const SESSION_COOKIE_NAME = "cammictest_session";
const SESSION_EXPIRY_DAYS = 7;
const OTP_EXPIRY_MINUTES = 10;
const OTP_DEBUG_FILE = path.join(process.cwd(), "data", "otp-debug.log");

// Generate a random cryptographically secure token
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Generate a 6-digit numeric OTP
function generate6DigitOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Log OTP to a developer file for local testing
function logOTPToDebugFile(email: string, otp: string) {
  const dir = path.dirname(OTP_DEBUG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] OTP for ${email}: ${otp} (Expires in ${OTP_EXPIRY_MINUTES} minutes)\n`;
  fs.appendFileSync(OTP_DEBUG_FILE, logMessage, "utf-8");
  console.log(`\n🔑 [DEV ONLY] OTP code sent to terminal/logs: ${otp}\n`);
}

// Send OTP email (Resend API check, with log fallback)
async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          from: "CamMicTest Security <security@cammictest.com>",
          to: email,
          subject: "Verification Code: Admin Dashboard",
          html: `<p>Your verification code is: <strong>${otp}</strong>. It expires in ${OTP_EXPIRY_MINUTES} minutes.</p>`
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Resend API failed:", errText);
        logOTPToDebugFile(email, otp); // fallback
      } else {
        console.log(`OTP successfully sent via Resend to ${email}`);
      }
    } catch (e) {
      console.error("Error calling Resend API:", e);
      logOTPToDebugFile(email, otp); // fallback
    }
  } else {
    // If no API Key, fallback to debug log files (perfect for local development)
    logOTPToDebugFile(email, otp);
  }
}

// Generate OTP and save to database
export async function createAndSendOTP(username: string): Promise<void> {
  const db = await readDb();
  if (db.admin.username !== username) return;

  const otp = generate6DigitOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  db.admin.otpCode = otp;
  db.admin.otpExpiresAt = expiresAt;

  await writeDb(db);
  await sendOTPEmail(username, otp);
}

// Verify OTP
export async function verifyOTPCode(username: string, code: string): Promise<boolean> {
  const db = await readDb();
  if (db.admin.username !== username) return false;

  const { otpCode, otpExpiresAt } = db.admin;

  if (!otpCode || !otpExpiresAt) return false;

  // Check expiration
  if (new Date() > new Date(otpExpiresAt)) {
    // Clear expired OTP
    db.admin.otpCode = undefined;
    db.admin.otpExpiresAt = undefined;
    await writeDb(db);
    return false;
  }

  if (otpCode !== code) return false;

  // Clear valid OTP on success
  db.admin.otpCode = undefined;
  db.admin.otpExpiresAt = undefined;
  await writeDb(db);
  return true;
}

// Create Session and set cookie
export async function establishSession(username: string): Promise<void> {
  const db = await readDb();
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const newSession: Session = {
    token,
    username,
    expiresAt
  };

  db.sessions.push(newSession);
  await writeDb(db);

  // Set HTTP-Only, Secure, SameSite cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(expiresAt),
    path: "/"
  });
}

// Check session from cookies
export async function getActiveSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const db = await readDb();
  const session = db.sessions.find((s) => s.token === token);

  if (!session) return null;

  // Check expiration
  if (new Date() > new Date(session.expiresAt)) {
    // Clean up expired session
    db.sessions = db.sessions.filter((s) => s.token !== token);
    await writeDb(db);
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return session;
}

// Revoke session and delete cookie
export async function terminateSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const db = await readDb();
    db.sessions = db.sessions.filter((s) => s.token !== token);
    await writeDb(db);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
