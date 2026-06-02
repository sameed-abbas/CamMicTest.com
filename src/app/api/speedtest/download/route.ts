import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Pre-allocate a 10MB block of zeroes in memory to avoid garbage-collection overhead
const dummyBuffer = new Uint8Array(10 * 1024 * 1024);

export async function GET(request: NextRequest) {
  // Enforce rate limiting: limit to 30 requests per minute for download API
  if (isRateLimited(request, 30)) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": "60",
      },
    });
  }

  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get("size");
  
  // Default: 10MB, Max: 10MB (hardened to prevent memory allocation exhaustion)
  let size = sizeParam ? parseInt(sizeParam, 10) : 10 * 1024 * 1024;
  if (isNaN(size) || size <= 0) size = 10 * 1024 * 1024;
  if (size > 10 * 1024 * 1024) size = 10 * 1024 * 1024;

  // Serve strictly as a slice of the pre-allocated static buffer view
  // This guarantees ZERO dynamic allocations, preventing V8 memory exhaustion attacks
  const responseBuffer = dummyBuffer.subarray(0, size);

  return new Response(responseBuffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": size.toString(),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Connection": "keep-alive"
    },
  });
}
