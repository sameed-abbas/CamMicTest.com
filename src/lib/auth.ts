import { cookies } from "next/headers";
import crypto from "crypto";
import { readDb, writeDb, Session } from "./db";

const SESSION_COOKIE_NAME = "cammictest_session";
const SESSION_EXPIRY_DAYS = 7;

// Generate a random cryptographically secure token
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
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
