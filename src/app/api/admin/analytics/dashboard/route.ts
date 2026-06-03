import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { getActiveSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify session credentials
    const session = await getActiveSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filterUrl = searchParams.get("url") || "";

    const db = await readDb();

    // 1. Basic Counts
    const totalPageviews = db.pageviews.length;
    
    // Unique sessions based on unique combinations of ipHash and date (e.g. day-level visitor retention)
    const uniqueSessions = new Set(
      db.pageviews.map((pv) => `${pv.ipHash}:${pv.timestamp.split("T")[0]}`)
    ).size;

    // 2. Pageviews by Path
    const pageviewsByUrl: Record<string, number> = {};
    db.pageviews.forEach((pv) => {
      pageviewsByUrl[pv.url] = (pageviewsByUrl[pv.url] || 0) + 1;
    });

    // 3. Referrers
    const referrers: Record<string, number> = {};
    db.pageviews.forEach((pv) => {
      const ref = pv.referrer ? new URL(pv.referrer).hostname : "direct";
      referrers[ref] = (referrers[ref] || 0) + 1;
    });

    // 4. Devices
    const devices: Record<string, number> = {};
    db.pageviews.forEach((pv) => {
      devices[pv.device] = (devices[pv.device] || 0) + 1;
    });

    // 5. Browsers
    const browsers: Record<string, number> = {};
    db.pageviews.forEach((pv) => {
      browsers[pv.browser] = (browsers[pv.browser] || 0) + 1;
    });

    // 6. Traffic Over Time (Past 7 days)
    const trafficHistory: Record<string, { views: number; visitors: number }> = {};
    const past7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    // Init history grid
    past7Days.forEach((date) => {
      trafficHistory[date] = { views: 0, visitors: 0 };
    });

    const visitorTracker = new Map<string, Set<string>>(); // Date -> Set of ipHashes
    past7Days.forEach((date) => {
      visitorTracker.set(date, new Set<string>());
    });

    db.pageviews.forEach((pv) => {
      const date = pv.timestamp.split("T")[0];
      if (trafficHistory[date]) {
        trafficHistory[date].views++;
        visitorTracker.get(date)?.add(pv.ipHash);
      }
    });

    past7Days.forEach((date) => {
      if (trafficHistory[date]) {
        trafficHistory[date].visitors = visitorTracker.get(date)?.size || 0;
      }
    });

    // 7. Click Coordinates for Heatmap
    // Filter clicks by URL parameter
    const heatmapClicks = db.clicks
      .filter((c) => !filterUrl || c.url === filterUrl)
      .map((c) => ({
        x: c.x,
        y: c.y,
        timestamp: c.timestamp
      }));

    return NextResponse.json({
      summary: {
        pageviews: totalPageviews,
        visitors: uniqueSessions,
      },
      pageviewsByUrl: Object.entries(pageviewsByUrl).map(([url, count]) => ({ url, count })),
      referrers: Object.entries(referrers).map(([referrer, count]) => ({ referrer, count })),
      devices: Object.entries(devices).map(([device, count]) => ({ device, count })),
      browsers: Object.entries(browsers).map(([browser, count]) => ({ browser, count })),
      trafficHistory: Object.entries(trafficHistory).map(([date, data]) => ({ date, ...data })),
      heatmapClicks
    });
  } catch (e) {
    console.error("Analytics Dashboard API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
