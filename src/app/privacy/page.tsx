import React from "react";
import { Shield } from "lucide-react";
import SchemaMarkup from "@/components/seo/SchemaMarkup";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <SchemaMarkup
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Privacy Policy - CamMicTest.com",
          "description": "Privacy policy outlining how media streams are handled entirely locally in the client browser.",
        }}
      />

      <section className="space-y-3 border-b border-border/40 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" /> Privacy Policy
        </h1>
        <p className="text-xs text-muted-foreground">
          Last Updated: June 02, 2026
        </p>
      </section>

      <article className="text-xs md:text-sm text-muted-foreground leading-relaxed space-y-6">
        <p>
          At <strong>CamMicTest.com</strong>, we are committed to safeguarding your privacy. This Privacy Policy outlines how our application interacts with your media hardware and what data (if any) is collected when you visit our website.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">1. Local Processing (Zero Recording Policy)</h2>
        <p>
          Our diagnostics tools—including the Webcam Test, Microphone Test, and Speaker Test—rely on HTML5 media streams (`getUserMedia` and Web Audio APIs) that run <strong>entirely inside your local web browser</strong>.
        </p>
        <p>
          We do not record, intercept, save, or transmit any video frames from your webcam or audio samples from your microphone. All diagnostic processing occurs in your computer's temporary memory (RAM) and is discarded as soon as you stop the test or navigate away from the page.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">2. Speed Test Diagnostics</h2>
        <p>
          To measure your download and upload throughput, the Internet Speed Test requests binary dummy packages from our servers. We do not inspect your personal network traffic. The IP address and temporary network characteristics are only parsed momentarily to execute the speed checks and are not logged.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">3. Cookies and Third-Party Advertising</h2>
        <p>
          We prepare our website with ad placement zones. Third-party vendors, including Google, may use cookies to serve ads based on your prior visits to this website or other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visit. You may opt out of personalized advertising by visiting your Google Ad Settings.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">4. Local Storage</h2>
        <p>
          We save your completed speed test history in your browser's `localStorage` so that you can compare connection stats over time. This data stays entirely on your physical device, and you can clear it at any time by clicking 'Clear History' on the Speed Test page.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">5. Changes to This Policy</h2>
        <p>
          We may update our privacy rules periodically. Any updates will be posted directly on this page with an adjusted 'Last Updated' date.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">6. Contact Us</h2>
        <p>
          If you have questions regarding our privacy credentials, feel free to contact us via our dedicated <a href="/contact" className="text-primary hover:underline font-semibold">Contact Page</a>.
        </p>
      </article>
    </div>
  );
}
