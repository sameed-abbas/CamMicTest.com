import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  color: string;
  readTime: string;
  status: "draft" | "published" | "scheduled";
  publishedAt: string; // ISO timestamp
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface PageView {
  id: string;
  url: string;
  referrer: string;
  device: string;
  browser: string;
  timestamp: string; // ISO timestamp
  ipHash: string;
}

export interface ClickEvent {
  id: string;
  url: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  timestamp: string; // ISO timestamp
  viewportWidth: number;
  viewportHeight: number;
}

export interface Session {
  token: string;
  username: string;
  expiresAt: string; // ISO timestamp
}

export interface AdminUser {
  username: string;
  passwordHash: string;
  twoFactorSecret?: string;
  twoFactorEnabled?: boolean;
}

export interface DbSchema {
  blogs: Blog[];
  pageviews: PageView[];
  clicks: ClickEvent[];
  sessions: Session[];
  admin: AdminUser;
}

// In-memory Mutex Lock to guarantee thread-safe file operations in Node.js
class Mutex {
  private queue: Promise<any> = Promise.resolve();

  async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.queue.then(fn);
    this.queue = next.catch(() => {});
    return next;
  }
}

const dbMutex = new Mutex();
const DB_FILE = path.join(process.cwd(), "data", "db.json");

// Helper to hash password securely using standard Node.js crypto (PBKDF2)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(":");
    const verify = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    return hash === verify;
  } catch (e) {
    return false;
  }
}

// Ensure the data directory exists and DB is seeded
function ensureDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const defaultDb: DbSchema = {
      blogs: [],
      pageviews: [],
      clicks: [],
      sessions: [],
      admin: {
        username: "Sameed@codener.com",
        // Seed default secure hash for password: vekdi9-pyGfin-firrat
        passwordHash: hashPassword("vekdi9-pyGfin-firrat")
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf-8");
  } else {
    // If DB exists, verify that admin user is present and correct
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8")) as DbSchema;
      if (!data.admin || data.admin.username !== "Sameed@codener.com") {
        data.admin = {
          username: "Sameed@codener.com",
          passwordHash: hashPassword("vekdi9-pyGfin-firrat")
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
      }
    } catch (e) {
      // Re-create if corrupt
      const defaultDb: DbSchema = {
        blogs: [],
        pageviews: [],
        clicks: [],
        sessions: [],
        admin: {
          username: "Sameed@codener.com",
          passwordHash: hashPassword("vekdi9-pyGfin-firrat")
        }
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf-8");
    }
  }
}

// Read database atomically
export async function readDb(): Promise<DbSchema> {
  return dbMutex.runExclusive(async () => {
    ensureDb();
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content) as DbSchema;
  });
}

// Write database atomically
export async function writeDb(data: DbSchema): Promise<void> {
  return dbMutex.runExclusive(async () => {
    ensureDb();
    // Write to a temporary file first, then rename atomically to prevent file corruption
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
  });
}
