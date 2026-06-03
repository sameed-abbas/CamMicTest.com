import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { BookOpen, Calendar, Clock, ArrowRight } from "lucide-react";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import AdSlot from "@/components/layout/AdSlot";

export const metadata: Metadata = {
  title: "Diagnostics & Troubleshooting Blog | CamMicTest.com",
  description: "Read expert guides and tutorials to fix webcam black screens, configure browser permissions, resolve microphone humming, and run speed tests.",
  alternates: {
    canonical: "https://cammictest.com/blog",
  },
  openGraph: {
    title: "Diagnostics & Troubleshooting Blog | CamMicTest.com",
    description: "Expert hardware troubleshooting tutorials and device guides from the engineering team at CamMicTest.com.",
    url: "https://cammictest.com/blog",
  }
};


interface ArticlePreview {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  color: string;
  imageUrl: string;
}

const ARTICLES: ArticlePreview[] = [
  {
    slug: "why-is-my-webcam-black",
    title: "Why is My Webcam Black? How to Fix Black Screen Camera Issues",
    excerpt: "Experiencing a black screen during video calls or testing? Learn the most common hardware and software bugs and how to fix them on Windows and macOS.",
    date: "June 02, 2026",
    readTime: "5 min read",
    category: "Webcam Help",
    color: "bg-indigo-500/10 text-indigo-500",
    imageUrl: "/blog-webcam-black.png",
  },
  {
    slug: "how-to-enable-camera-mic",
    title: "How to Enable Camera & Microphone Permissions in Major Browsers",
    excerpt: "A step-by-step guide to unblocking and enabling camera and microphone permission prompts in Google Chrome, Apple Safari, Mozilla Firefox, and Microsoft Edge.",
    date: "May 25, 2026",
    readTime: "6 min read",
    category: "Browser Settings",
    color: "bg-emerald-500/10 text-emerald-500",
    imageUrl: "/blog-enable-permissions.png",
  }
];

import { readDb } from "@/lib/db";

export default async function BlogPage() {
  let dbBlogs: any[] = [];
  try {
    const db = await readDb();
    const now = new Date();
    dbBlogs = db.blogs
      .filter((b) => b.status === "published" || (b.status === "scheduled" && new Date(b.publishedAt) <= now))
      .map((b) => ({
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt,
        date: new Date(b.publishedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        readTime: b.readTime,
        category: b.category,
        color: b.color,
        imageUrl: b.imageUrl,
        createdAt: b.publishedAt
      }));
  } catch (e) {
    console.error("Failed to read database blogs on blog page:", e);
  }

  const staticArticles = ARTICLES.map((a) => ({
    ...a,
    createdAt: new Date(a.date).toISOString()
  }));

  const allArticles = [...dbBlogs, ...staticArticles].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <SchemaMarkup
        schema={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "CamMicTest.com Diagnostics & Troubleshooting Blog",
          "description": "Expert advice, guides, and tutorials to solve camera stutters, microphone hiss, stereo panning offsets, and network packet loss.",
        }}
      />

      {/* Header */}
      <section className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary" /> Troubleshooting Blog
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Expert guides and tutorials written by our engineering team to help you troubleshoot device connection bugs, browser blocks, and network configurations.
        </p>
      </section>

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {allArticles.map((article) => (
          <article 
            key={article.slug}
            className="flex flex-col bg-card border border-border/45 rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-350 hover:-translate-y-1"
          >
            <div className="w-full aspect-video bg-neutral-900 overflow-hidden border-b border-border/20">
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105" 
              />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${article.color}`}>
                  {article.category}
                </span>
                <h2 className="text-lg font-bold leading-snug text-foreground hover:text-primary transition-colors">
                  <Link href={`/blog/${article.slug}`}>
                    {article.title}
                  </Link>
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
              </div>

              {/* Metadata and Link */}
              <div className="flex items-center justify-between pt-4 border-t border-border/30 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {article.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readTime}
                  </span>
                </div>
                <Link
                  href={`/blog/${article.slug}`}
                  className="font-bold text-primary hover:underline flex items-center gap-1 group text-xs"
                >
                  Read Article 
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <AdSlot id="blog-bottom-leaderboard" format="horizontal" />
    </div>
  );
}
