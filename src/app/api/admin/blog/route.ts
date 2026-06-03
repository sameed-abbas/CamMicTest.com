import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, Blog } from "@/lib/db";
import { getActiveSession } from "@/lib/auth";
import crypto from "crypto";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes || 1} min read`;
}

// GET: Fetch all blogs (Admin list - requires authentication)
export async function GET() {
  try {
    const session = await getActiveSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await readDb();
    // Sort by creation date descending
    const blogs = [...db.blogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(blogs);
  } catch (e) {
    console.error("Blog GET API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create a new blog post (Requires authentication)
export async function POST(request: NextRequest) {
  try {
    const session = await getActiveSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, excerpt, content, imageUrl, category, color, status, publishedAt } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const db = await readDb();
    const slug = slugify(title);

    // Verify unique slug
    if (db.blogs.some((b) => b.slug === slug)) {
      return NextResponse.json({ error: "A blog post with a similar title already exists" }, { status: 409 });
    }

    const now = new Date().toISOString();
    const newBlog: Blog = {
      id: crypto.randomUUID(),
      title,
      slug,
      excerpt: excerpt || content.substring(0, 150).replace(/[#*`\n]/g, "") + "...",
      content,
      imageUrl: imageUrl || "/blog-webcam-black.png",
      category: category || "General",
      color: color || "bg-indigo-500/10 text-indigo-500",
      readTime: calculateReadTime(content),
      status: status || "draft",
      publishedAt: publishedAt || now,
      createdAt: now,
      updatedAt: now
    };

    db.blogs.push(newBlog);
    await writeDb(db);

    return NextResponse.json(newBlog, { status: 201 });
  } catch (e) {
    console.error("Blog POST API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update an existing blog post (Requires authentication)
export async function PUT(request: NextRequest) {
  try {
    const session = await getActiveSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, excerpt, content, imageUrl, category, color, status, publishedAt } = body;

    if (!id || !title || !content) {
      return NextResponse.json({ error: "ID, title, and content are required" }, { status: 400 });
    }

    const db = await readDb();
    const blogIndex = db.blogs.findIndex((b) => b.id === id);

    if (blogIndex === -1) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    const existingBlog = db.blogs[blogIndex];
    const newSlug = slugify(title);

    // Check slug uniqueness if title changed
    if (newSlug !== existingBlog.slug && db.blogs.some((b) => b.slug === newSlug)) {
      return NextResponse.json({ error: "A blog post with a similar title already exists" }, { status: 409 });
    }

    const updatedBlog: Blog = {
      ...existingBlog,
      title,
      slug: newSlug,
      excerpt: excerpt || content.substring(0, 150).replace(/[#*`\n]/g, "") + "...",
      content,
      imageUrl: imageUrl || existingBlog.imageUrl,
      category: category || existingBlog.category,
      color: color || existingBlog.color,
      readTime: calculateReadTime(content),
      status: status || existingBlog.status,
      publishedAt: publishedAt || existingBlog.publishedAt,
      updatedAt: new Date().toISOString()
    };

    db.blogs[blogIndex] = updatedBlog;
    await writeDb(db);

    return NextResponse.json(updatedBlog);
  } catch (e) {
    console.error("Blog PUT API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete a blog post (Requires authentication)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getActiveSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Blog ID is required" }, { status: 400 });
    }

    const db = await readDb();
    const exists = db.blogs.some((b) => b.id === id);

    if (!exists) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    db.blogs = db.blogs.filter((b) => b.id !== id);
    await writeDb(db);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Blog DELETE API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
