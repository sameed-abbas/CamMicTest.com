import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await readDb();
    const now = new Date();
    
    // Filter out drafts and future-scheduled posts
    const publishedBlogs = db.blogs
      .filter((b) => b.status === "published" || (b.status === "scheduled" && new Date(b.publishedAt) <= now))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return NextResponse.json(publishedBlogs);
  } catch (e) {
    console.error("Public Blog GET API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
