import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArrowLeft, Calendar, Clock, BookOpen, AlertTriangle } from "lucide-react";
import { readDb } from "@/lib/db";
import { getActiveSession } from "@/lib/auth";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import AdSlot from "@/components/layout/AdSlot";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Simple regex Markdown parser to avoid heavy dependency trees
function parseMarkdown(md: string): string {
  if (!md) return "";
  
  // Basic escaping to prevent injection attacks (leaving tags like code/strong intact)
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Parse Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-foreground mt-6 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-foreground mt-8 mb-3">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-foreground mt-10 mb-4">$1</h1>');
  
  // Parse Bold & Italics
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  
  // Inline Code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-neutral-800 text-[11px] font-mono px-1.5 py-0.5 rounded text-white">$1</code>');
  
  // Bullet lists (group consecutive list items)
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-muted-foreground">$1</li>');

  // Wrap in paragraphs
  const lines = html.split("\n\n");
  const parsedLines = lines.map(line => {
    if (line.trim().startsWith("<h") || line.trim().startsWith("<li")) {
      return line;
    }
    return `<p class="mt-4 leading-relaxed">${line.replace(/\n/g, "<br />")}</p>`;
  });

  return parsedLines.join("");
}

// Generate dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const db = await readDb();
  const blog = db.blogs.find((b) => b.slug === slug);

  if (!blog) {
    return {
      title: "Article Not Found | CamMicTest.com",
    };
  }

  return {
    title: `${blog.title} | CamMicTest.com`,
    description: blog.excerpt,
    alternates: {
      canonical: `https://cammictest.com/blog/${blog.slug}`,
    },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      url: `https://cammictest.com/blog/${blog.slug}`,
      images: [{ url: blog.imageUrl }]
    }
  };
}

export default async function DynamicBlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const db = await readDb();
  const blog = db.blogs.find((b) => b.slug === slug);

  if (!blog) {
    notFound();
  }

  // Evaluate scheduling / draft access privileges
  const isFutureScheduled = new Date(blog.publishedAt) > new Date();
  const isPrivate = blog.status === "draft" || (blog.status === "scheduled" && isFutureScheduled);

  if (isPrivate) {
    const session = await getActiveSession();
    // If not authenticated admin, show 404
    if (!session) {
      notFound();
    }
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.excerpt,
    "datePublished": blog.publishedAt.split("T")[0],
    "author": {
      "@type": "Organization",
      "name": "CamMicTest.com Editorial"
    }
  };

  const parsedHtmlContent = parseMarkdown(blog.content);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <SchemaMarkup schema={articleSchema} />

      {/* Back to Blog */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Troubleshooting Blog
      </Link>

      {/* Admin preview notice */}
      {isPrivate && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 my-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-500 mb-1">Administrator Preview Mode</h4>
            <p className="text-muted-foreground">
              This blog is currently a **{blog.status}** {blog.status === "scheduled" ? `(scheduled for ${new Date(blog.publishedAt).toLocaleString()})` : ""}. Guest visitors cannot view this page.
            </p>
          </div>
        </div>
      )}

      {/* Article Title */}
      <section className="space-y-4 border-b border-border/40 pb-6">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
          {blog.title}
        </h1>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(blog.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {blog.readTime}
          </span>
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-muted/65 text-muted-foreground">
            {blog.category}
          </span>
        </div>
      </section>

      {/* Article Image Banner */}
      <div className="w-full aspect-[21/9] bg-neutral-900 overflow-hidden rounded-2xl border border-border/30">
        <img 
          src={blog.imageUrl} 
          alt={blog.title} 
          className="w-full h-full object-cover object-center" 
        />
      </div>

      {/* Main Content */}
      <article 
        className="prose dark:prose-invert max-w-none text-xs md:text-sm text-muted-foreground leading-relaxed space-y-4"
        dangerouslySetInnerHTML={{ __html: parsedHtmlContent }}
      />

      <AdSlot id="article-bottom-leaderboard" format="horizontal" />
    </div>
  );
}
