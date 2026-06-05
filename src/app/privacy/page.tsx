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

        <h2 className="text-lg font-bold text-foreground mt-6">3. Cookies, Telemetry, and Consent</h2>
        <p>
          We use cookies and browser storage technologies to support essential features and analyze website performance:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>
            <strong>Essential Cookies & Session Identifiers:</strong> We set cookies such as <code>cammictest_consent</code> to save your cookie preference states and <code>cammictest_session</code> to authenticate sessions securely within our administrative dashboard. These cookies are essential and cannot be deactivated.
          </li>
          <li>
            <strong>Analytics & Usage Telemetry:</strong> If you explicitly opt in, we collect anonymous usage statistics including paths navigated and click heatmap coordinates (recorded as percentage values relative to the viewport size to protect privacy). IP addresses are hashed using SHA-256 immediately upon receipt and are not stored in raw format.
          </li>
        </ul>
        <p className="mt-4">
          You can adjust or revoke your cookies consent settings at any time by clicking the <strong>Cookie Settings</strong> link in our website footer.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">4. Local Storage Data</h2>
        <p>
          We save your completed speed test history in your browser's local storage (<code>localStorage</code>) to enable comparisons of connection performance over time. This data is strictly local, never leaves your physical device, and can be cleared instantly by clicking the 'Clear History' command on the Speed Test dashboard.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">5. GDPR Compliance & Your Data Rights</h2>
        <p>
          Under the General Data Protection Regulation (GDPR), visitors residing in the European Union (EU) have specific rights regarding personal data:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li><strong>Right to Access:</strong> You can request verification of whether we process personal data. Since our diagnostics are processed locally and analytics are fully hashed and anonymized, we do not associate physical device identities with individuals.</li>
          <li><strong>Right to Erasure (Opt-Out):</strong> You have the right to withdraw tracking consent at any time, which halts all telemetry tracking immediately.</li>
          <li><strong>Right to Object:</strong> You can object to data processing for marketing or analytics.</li>
        </ul>

        <h2 className="text-lg font-bold text-foreground mt-6">6. Changes to This Policy</h2>
        <p>
          We may update our privacy guidelines periodically to align with browser API adjustments or regulatory requirements. Any updates will be published on this page with an updated 'Last Updated' timestamp.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">7. Contact Us</h2>
        <p>
          If you have questions regarding our privacy compliance or local media stream processing, you are welcome to contact our team via the <a href="/contact" className="text-primary hover:underline font-semibold">Contact Page</a>.
        </p>
      </article>
    </div>
  );
}

