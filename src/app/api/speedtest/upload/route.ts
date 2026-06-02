import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const MAX_UPLOAD_LIMIT = 10 * 1024 * 1024; // 10MB maximum upload limit

export async function POST(request: NextRequest) {
  // Enforce rate limiting: limit to 30 requests per minute for upload API
  if (isRateLimited(request, 30)) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": "60",
      },
    });
  }

  try {
    // Validate request size upfront using Content-Length header
    const contentLength = request.headers.get("content-length");
    if (contentLength) {
      const parsedSize = parseInt(contentLength, 10);
      if (!isNaN(parsedSize) && parsedSize > MAX_UPLOAD_LIMIT) {
        return NextResponse.json(
          { success: false, error: "Payload too large. Maximum size is 10MB." },
          { status: 413 }
        );
      }
    }

    let bytesUploaded = 0;

    // Process stream with size limits to prevent V8 memory exhaustion DoS
    if (request.body) {
      const reader = request.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          bytesUploaded += value.length;
          if (bytesUploaded > MAX_UPLOAD_LIMIT) {
            // Cancel the reader stream immediately to release the connection socket
            await reader.cancel();
            return NextResponse.json(
              { success: false, error: "Payload limit exceeded (10MB)." },
              { status: 413 }
            );
          }
        }
      }
    } else {
      const data = await request.arrayBuffer();
      bytesUploaded = data.byteLength;
      if (bytesUploaded > MAX_UPLOAD_LIMIT) {
        return NextResponse.json(
          { success: false, error: "Payload limit exceeded (10MB)." },
          { status: 413 }
        );
      }
    }

    return NextResponse.json(
      { success: true, bytesUploaded },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
