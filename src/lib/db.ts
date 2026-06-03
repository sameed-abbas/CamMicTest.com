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
  ip?: string;
  device?: string;
  browser?: string;
  createdAt?: string; // ISO timestamp
}

export interface AdminUser {
  username: string;
  passwordHash: string;
  name?: string;
  profilePhoto?: string;
  emailVerified?: boolean;
  twoFactorSecret?: string;
  twoFactorEnabled?: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  username: string;
  timestamp: string; // ISO timestamp
  ip: string;
  device: string;
  browser: string;
  status: "success" | "failed" | "otp_pending";
}

export interface AuditLogEntry {
  id: string;
  username: string;
  action: string; // e.g. "blog_create", "blog_delete", "settings_update", "password_change"
  details: string;
  timestamp: string; // ISO timestamp
  ip: string;
  device: string;
}

export interface SecurityAlert {
  id: string;
  type: "suspicious_login" | "failed_login" | "password_change" | "two_factor_toggle";
  message: string;
  timestamp: string; // ISO timestamp
  ip: string;
  device: string;
  resolved: boolean;
}

export interface DbSchema {
  blogs: Blog[];
  pageviews: PageView[];
  clicks: ClickEvent[];
  sessions: Session[];
  admin: AdminUser;
  loginHistory: LoginHistoryEntry[];
  auditLogs: AuditLogEntry[];
  securityAlerts: SecurityAlert[];
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

// Default Seed Blogs
const seedBlogs: Blog[] = [
  {
    id: "seed-blog-permissions",
    title: "How to Enable Camera & Microphone Permissions in Major Browsers",
    slug: "how-to-enable-camera-mic",
    category: "Browser Settings",
    color: "bg-emerald-500/10 text-emerald-500",
    excerpt: "Step-by-step browser guides to allow camera and mic permissions on Google Chrome, Apple Safari, Firefox, and Microsoft Edge.",
    imageUrl: "/blog-enable-permissions.png",
    readTime: "6 min read",
    status: "published",
    content: `To protect user privacy, modern browsers require explicit user permission before any website can access a webcam or microphone stream. If you accidentally block this prompt, the site will not be able to test your hardware.

Fortunately, unblocking camera and microphone permissions is simple. In this article, we outline the exact steps to enable permissions in Google Chrome, Apple Safari, Mozilla Firefox, and Microsoft Edge.

## 1. Google Chrome (Desktop & Mobile)

Google Chrome displays a padlock icon in the address bar where you can configure permissions directly:

1. Navigate to the test page (e.g., Webcam Test).
2. Look at the left end of the URL bar at the top and click the **Padlock or Page settings icon 🔒**.
3. In the menu that appears, locate **Camera** and **Microphone**.
4. Toggle both settings to **Allow**.
5. Reload the page when Chrome prompts you.

## 2. Apple Safari (macOS & iOS)

Safari manages website permissions inside its system and browser settings panel:

### On macOS:
1. Open the test website in Safari.
2. Click **Safari** in the top menu bar and select **Settings for This Website...**.
3. Hover over the pop-up box and set **Camera** and **Microphone** to **Allow**.
4. Alternatively, go to Safari Preferences -> Websites -> Camera/Microphone and select the URL.

### On iOS (iPhone/iPad):
1. Open the iOS **Settings** app.
2. Scroll down and tap **Safari**.
3. Scroll down to the 'Settings for Websites' section and select **Camera** or **Microphone**.
4. Change the default access state from 'Ask' or 'Deny' to **Allow**.

## 3. Mozilla Firefox

Firefox allows site permission clearing directly from the address bar block icon:

1. Look at the address bar and click the **Camera/Mic permissions icon** (located just to the left of the URL text).
2. Click the 'X' button next to **Blocked Temporarily** to clear the restriction.
3. Refresh the page. When the browser prompts you for access, check the 'Remember this decision' box and click **Allow**.

## 4. Microsoft Edge

Microsoft Edge uses Chromium architecture, so its permission setup mirrors Google Chrome:

1. Click the **Lock icon 🔒** on the left side of the address bar.
2. Locate the toggles for **Camera** and **Microphone** and switch them to **Allow**.
3. If the toggles do not appear, click **Permissions for this site** to open the full settings menu.
4. Set the dropdowns next to Camera and Microphone to 'Allow' and reload the page.`,
    publishedAt: "2026-05-25T12:00:00.000Z",
    createdAt: "2026-05-25T12:00:00.000Z",
    updatedAt: "2026-05-25T12:00:00.000Z"
  },
  {
    id: "seed-blog-webcam-black",
    title: "Why is My Webcam Black? How to Fix Black Screen Camera Issues",
    slug: "why-is-my-webcam-black",
    category: "Webcam Help",
    color: "bg-indigo-500/10 text-indigo-500",
    excerpt: "Troubleshoot why your laptop webcam is showing a black screen during tests or Zoom video calls. Step-by-step repair guides for Windows and Mac.",
    imageUrl: "/blog-webcam-black.png",
    readTime: "5 min read",
    status: "published",
    content: `Few things are more frustrating than joining a crucial video meeting or starting an online webcam test, only to be greeted by a blank, pitch-black screen. Your camera indicator light might be glowing green, but your feed is nowhere to be seen.

In this guide, we will walk you through the most common reasons why your webcam screen is black and outline step-by-step diagnostics to fix it on both Windows and macOS systems.

## 1. Check the Physical Hardware Switches

Before diving into software configurations, inspect your device's physical surroundings. Many modern webcams and laptops feature built-in hardware protection:

- **Privacy Sliders:** Many external webcams and laptop Bezels (such as Lenovo, HP, and Dell) have a tiny slider switch directly above the lens. Ensure it is slid open.
- **Keyboard Hotkeys:** Some laptops have a physical webcam cutoff key (usually on the F-row, e.g., F10 or F11, showing a camera icon with a line through it). Try pressing this key (or Fn + key) to toggle the camera power state.
- **USB Connections:** If you use an external USB camera, unplug it, wait 5 seconds, and insert it into a different USB port. Avoid USB hubs where possible to rule out power drops.

## 2. Shut Down Conflicting Background Applications

Webcams can only stream to one application at a time. If another software program is accessing your video feed, your browser test will show a blank black window.

Close Zoom, Microsoft Teams, Skype, Discord, OBS Studio, and slack. If the stream is still locked, restart your computer to clear any rogue media background services.

## 3. Check Operating System Camera Privacy Permissions

Both macOS and Windows systems restrict camera access by default. You must allow desktop browsers permission to access the webcam:

### On Windows 10 & 11:
1. Open system **Settings** -> **Privacy & Security**.
2. Scroll down to App Permissions and click on **Camera**.
3. Ensure **Camera Access** is toggled to ON.
4. Verify that **Let desktop apps access your camera** is toggled ON, and that your web browser (Chrome, Edge, Firefox) is allowed.

### On macOS:
1. Click the Apple logo -> **System Settings**.
2. Select **Privacy & Security** -> **Camera**.
3. Ensure the toggle switch beside your Web Browser (Safari, Google Chrome, etc.) is flipped to green.
4. Restart your browser to apply the settings.

## 4. Reinstall or Update Web Camera Drivers (Windows)

Failing or outdated drivers can cause cameras to freeze. To resolve driver errors on Windows:

1. Right-click the Start Menu and select **Device Manager**.
2. Expand the **Cameras** or **Imaging Devices** category.
3. Right-click your webcam and select **Update Driver**. Choose search automatically.
4. If it fails, select **Uninstall Device**, unplug the camera (or restart your laptop), and let Windows auto-reinstall the driver on startup.`,
    publishedAt: "2026-06-02T12:00:00.000Z",
    createdAt: "2026-06-02T12:00:00.000Z",
    updatedAt: "2026-06-02T12:00:00.000Z"
  }
];

// Ensure the data directory exists and DB is seeded
function ensureDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const defaultDb: DbSchema = {
    blogs: seedBlogs,
    pageviews: [],
    clicks: [],
    sessions: [],
    admin: {
      username: "Sameed@codener.com",
      passwordHash: hashPassword("vekdi9-pyGfin-firrat"),
      name: "Sameed Abbas",
      profilePhoto: "/logo-white.png",
      emailVerified: true
    },
    loginHistory: [],
    auditLogs: [],
    securityAlerts: []
  };

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf-8");
  } else {
    // If DB exists, perform safe schema migration to initialize new tables
    try {
      let isModified = false;
      const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8")) as any;

      if (!data.loginHistory) {
        data.loginHistory = [];
        isModified = true;
      }
      if (!data.auditLogs) {
        data.auditLogs = [];
        isModified = true;
      }
      if (!data.securityAlerts) {
        data.securityAlerts = [];
        isModified = true;
      }
      
      // Migrate admin profile defaults
      if (!data.admin) {
        data.admin = defaultDb.admin;
        isModified = true;
      } else {
        if (data.admin.username !== "Sameed@codener.com") {
          data.admin.username = "Sameed@codener.com";
          isModified = true;
        }
        if (!data.admin.name) {
          data.admin.name = "Sameed Abbas";
          isModified = true;
        }
        if (!data.admin.profilePhoto) {
          data.admin.profilePhoto = "/logo-white.png";
          isModified = true;
        }
        if (data.admin.emailVerified === undefined) {
          data.admin.emailVerified = true;
          isModified = true;
        }
      }

      // Seed blogs if list is empty
      if (!data.blogs || data.blogs.length === 0) {
        data.blogs = seedBlogs;
        isModified = true;
      }

      if (isModified) {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
      }
    } catch (e) {
      // Recreate database on failure
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
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
  });
}
