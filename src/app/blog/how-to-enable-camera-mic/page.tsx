import React from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, BookOpen, Settings, ShieldCheck } from "lucide-react";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import AdSlot from "@/components/layout/AdSlot";

export default function BrowserPermissionsArticle() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "How to Enable Camera & Microphone Permissions in Major Browsers",
    "description": "Step-by-step browser guides to allow camera and mic permissions on Google Chrome, Apple Safari, Firefox, and Microsoft Edge.",
    "datePublished": "2026-05-25",
    "author": {
      "@type": "Organization",
      "name": "CamMicTest.com Editorial"
    }
  };

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

      {/* Article Title */}
      <section className="space-y-4 border-b border-border/40 pb-6">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
          How to Enable Camera & Microphone Permissions in Major Browsers
        </h1>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            May 25, 2026
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            6 min read
          </span>
        </div>
      </section>

      {/* Main Content */}
      <article className="prose dark:prose-invert max-w-none text-xs md:text-sm text-muted-foreground leading-relaxed space-y-6">
        <p>
          To protect user privacy, modern browsers require explicit user permission before any website can access a webcam or microphone stream. If you accidentally block this prompt, the site will not be able to test your hardware.
        </p>

        <p>
          Fortunately, unblocking camera and microphone permissions is simple. In this article, we outline the exact steps to enable permissions in Google Chrome, Apple Safari, Mozilla Firefox, and Microsoft Edge.
        </p>

        <AdSlot id="article-2-middle-rectangle" format="rectangle" className="mx-auto" />

        <h2 className="text-xl font-bold text-foreground mt-8">1. Google Chrome (Desktop & Mobile)</h2>
        <p>
          Google Chrome displays a padlock icon in the address bar where you can configure permissions directly:
        </p>
        <ol className="list-decimal list-inside pl-4 space-y-2">
          <li>Navigate to the test page (e.g., <Link href="/webcam-test" className="text-primary hover:underline">Webcam Test</Link>).</li>
          <li>Look at the left end of the URL bar at the top and click the <strong>Padlock or Page settings icon 🔒</strong>.</li>
          <li>In the menu that appears, locate <strong>Camera</strong> and <strong>Microphone</strong>.</li>
          <li>Toggle both settings to <strong>Allow</strong>.</li>
          <li>Reload the page when Chrome prompts you.</li>
        </ol>

        <h2 className="text-xl font-bold text-foreground mt-8">2. Apple Safari (macOS & iOS)</h2>
        <p>
          Safari manages website permissions inside its system and browser settings panel:
        </p>
        <h3 className="text-base font-bold text-foreground mt-4">On macOS:</h3>
        <ol className="list-decimal list-inside pl-4 space-y-2">
          <li>Open the test website in Safari.</li>
          <li>Click <strong>Safari</strong> in the top menu bar and select <strong>Settings for This Website...</strong>.</li>
          <li>Hover over the pop-up box and set <strong>Camera</strong> and <strong>Microphone</strong> to <strong>Allow</strong>.</li>
          <li>Alternatively, go to Safari Preferences &rarr; Websites &rarr; Camera/Microphone and select the URL.</li>
        </ol>

        <h3 className="text-base font-bold text-foreground mt-4">On iOS (iPhone/iPad):</h3>
        <ol className="list-decimal list-inside pl-4 space-y-2">
          <li>Open the iOS <strong>Settings</strong> app.</li>
          <li>Scroll down and tap <strong>Safari</strong>.</li>
          <li>Scroll down to the 'Settings for Websites' section and select <strong>Camera</strong> or <strong>Microphone</strong>.</li>
          <li>Change the default access state from 'Ask' or 'Deny' to <strong>Allow</strong>.</li>
        </ol>

        <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex gap-3 my-6">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-foreground mb-1">Verify Your Permissions:</h4>
            To check if your browser configurations are correct, run a step-by-step diagnostic test inside our <Link href="/device-check" className="text-primary font-semibold hover:underline">All-in-One Device Check Wizard</Link>.
          </div>
        </div>

        <h2 className="text-xl font-bold text-foreground mt-8">3. Mozilla Firefox</h2>
        <p>
          Firefox allows site permission clearing directly from the address bar block icon:
        </p>
        <ol className="list-decimal list-inside pl-4 space-y-2">
          <li>Look at the address bar and click the <strong>Camera/Mic permissions icon</strong> (located just to the left of the URL text).</li>
          <li>Click the 'X' button next to <strong>Blocked Temporarily</strong> to clear the restriction.</li>
          <li>Refresh the page. When the browser prompts you for access, check the 'Remember this decision' box and click <strong>Allow</strong>.</li>
        </ol>

        <h2 className="text-xl font-bold text-foreground mt-8">4. Microsoft Edge</h2>
        <p>
          Microsoft Edge uses Chromium architecture, so its permission setup mirrors Google Chrome:
        </p>
        <ol className="list-decimal list-inside pl-4 space-y-2">
          <li>Click the <strong>Lock icon 🔒</strong> on the left side of the address bar.</li>
          <li>Locate the toggles for <strong>Camera</strong> and <strong>Microphone</strong> and switch them to <strong>Allow</strong>.</li>
          <li>If the toggles do not appear, click <strong>Permissions for this site</strong> to open the full settings menu.</li>
          <li>Set the dropdowns next to Camera and Microphone to 'Allow' and reload the page.</li>
        </ol>
      </article>

      <AdSlot id="article-2-bottom-leaderboard" format="horizontal" />
    </div>
  );
}
