import { NextRequest } from "next/server";

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const trackers = new Map<string, RateLimitTracker>();

// Periodic in-memory garbage-collection to prevent memory leaks from inactive IPs
if (typeof globalThis !== "undefined") {
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [ip, tracker] of trackers.entries()) {
      if (now > tracker.resetTime) {
        trackers.delete(ip);
      }
    }
  }, 60000);

  // Allow Node process exit when running script or testing
  if (interval && typeof interval.unref === "function") {
    interval.unref();
  }
}

/**
 * Checks if a client IP address has exceeded a rate limit window.
 *
 * @param request The incoming NextRequest context
 * @param limit Maximum allowed hits per window (default: 60)
 * @param windowMs The window duration in milliseconds (default: 60000 / 1 minute)
 * @returns Boolean true if the request is blocked, false if allowed
 */
export function isRateLimited(request: NextRequest, limit = 60, windowMs = 60000): boolean {
  // Extract client IP address from request metadata or load-balancer headers
  const rawIp = request.headers.get("x-forwarded-for") || (request as any).ip || "127.0.0.1";
  
  // Extract first IP if list is provided (e.g. from multiple proxies)
  const ip = rawIp.split(",")[0].trim();
  
  const now = Date.now();
  const tracker = trackers.get(ip);

  // If no entry exists or the window has expired, reset tracker
  if (!tracker || now > tracker.resetTime) {
    trackers.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return false;
  }

  // Increment hit counter and evaluate limit thresholds
  tracker.count++;
  if (tracker.count > limit) {
    return true;
  }

  return false;
}
