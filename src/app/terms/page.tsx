import React from "react";
import { FileText } from "lucide-react";
import SchemaMarkup from "@/components/seo/SchemaMarkup";

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <SchemaMarkup
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Terms of Service - CamMicTest.com",
          "description": "Terms of service outlining free website usage boundaries and diagnostic software disclaimers.",
        }}
      />

      <section className="space-y-3 border-b border-border/40 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl flex items-center gap-2">
          <FileText className="w-8 h-8 text-primary" /> Terms of Service
        </h1>
        <p className="text-xs text-muted-foreground">
          Last Updated: June 02, 2026
        </p>
      </section>

      <article className="text-xs md:text-sm text-muted-foreground leading-relaxed space-y-6">
        <p>
          Welcome to <strong>CamMicTest.com</strong>. By accessing or using our free online webcam, microphone, speaker, and connection speed testing tools, you agree to comply with and be bound by the following Terms of Service.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">1. Acceptance of Terms</h2>
        <p>
          By using our services, you warrant that you are at least 13 years of age and possess the legal authority to agree to these terms. If you do not agree to any part of these terms, you must cease using our website immediately.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">2. Use License</h2>
        <p>
          We grant you permission to temporarily access and run our browser-based diagnostics for personal, non-commercial testing purposes. Under this license, you may not:
        </p>
        <ul className="list-disc list-inside pl-4 space-y-2">
          <li>Modify, reverse engineer, or copy our underlying client scripts.</li>
          <li>Use automated scraping bots to extract diagnostic metrics.</li>
          <li>Attempt to overload or DDoS our speed test download/upload endpoints.</li>
          <li>Use our diagnostic metrics to formulate fraudulent warranty claims.</li>
        </ul>

        <h2 className="text-lg font-bold text-foreground mt-6">3. Disclaimer of Warranties</h2>
        <p>
          The materials and tools on CamMicTest.com are provided on an <strong>"as is"</strong> and <strong>"as available"</strong> basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties, including without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
        </p>
        <p>
          We do not guarantee that our tests will detect 100% of hardware failure cases, or that your web browser will be compatible with our HTML5 scripts.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">4. Limitations of Liability</h2>
        <p>
          In no event shall CamMicTest.com or its operators be liable for any damages (including, without limitation, damages for loss of data, profit, or due to business interruption) arising out of the use or inability to use our diagnostic scripts, even if we have been notified orally or in writing of the possibility of such damage.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">5. Revisions and Errata</h2>
        <p>
          The content appearing on our website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our website are accurate, complete, or current. We may make changes to the materials contained on our web site at any time without notice.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">6. Governing Law</h2>
        <p>
          Any claim relating to CamMicTest.com shall be governed by the laws of our operating jurisdiction, without regard to its conflict of law provisions.
        </p>
      </article>
    </div>
  );
}
