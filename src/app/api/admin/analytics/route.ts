import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, PageView, ClickEvent } from "@/lib/db";
import { isRateLimited } from "@/lib/rateLimit";
import crypto from "crypto";

const MAX_LOG_ENTRIES = 10000;

export async function POST(request: NextRequest) {
  try {
    // Apply IP rate limiting to prevent spam bloating the JSON file
    const isLimitExceeded = isRateLimited(request, 120, 60 * 1000); // 120 hits per minute for analytics

    if (isLimitExceeded) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const ip = (request as any).ip || request.headers.get("x-forwarded-for") || "127.0.0.1";
    const body = await request.json();
    const { type, payload } = body;

    if (!type || !payload) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    const db = await readDb();
    const timestamp = new Date().toISOString();
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16);

    if (type === "pageview") {
      const { url, referrer, device, browser } = payload;
      if (!url) return NextResponse.json({ error: "URL is required for pageview" }, { status: 400 });

      const newPageView: PageView = {
        id: crypto.randomUUID(),
        url: url.substring(0, 255),
        referrer: (referrer || "").substring(0, 255),
        device: (device || "unknown").substring(0, 50),
        browser: (browser || "unknown").substring(0, 50),
        timestamp,
        ipHash
      };

      db.pageviews.push(newPageView);

      // Prevent database growth DoS: Keep only the latest 10,000 entries
      if (db.pageviews.length > MAX_LOG_ENTRIES) {
        db.pageviews = db.pageviews.slice(db.pageviews.length - MAX_LOG_ENTRIES);
      }
    } 
    
    else if (type === "click") {
      const { url, x, y, viewportWidth, viewportHeight } = payload;
      if (!url || x === undefined || y === undefined) {
        return NextResponse.json({ error: "URL and click coordinates are required" }, { status: 400 });
      }

      const newClick: ClickEvent = {
        id: crypto.randomUUID(),
        url: url.substring(0, 255),
        x: parseFloat(x),
        y: parseFloat(y),
        timestamp,
        viewportWidth: parseInt(viewportWidth) || 0,
        viewportHeight: parseInt(viewportHeight) || 0
      };

      db.clicks.push(newClick);

      // Prevent database growth DoS: Keep only the latest 10,000 entries
      if (db.clicks.length > MAX_LOG_ENTRIES) {
        db.clicks = db.clicks.slice(db.clicks.length - MAX_LOG_ENTRIES);
      }
    } 
    
    else {
      return NextResponse.json({ error: "Unsupported tracking type" }, { status: 400 });
    }

    await writeDb(db);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Analytics collector error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
