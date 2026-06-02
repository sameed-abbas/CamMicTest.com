import React from "react";

interface SchemaMarkupProps {
  schema: Record<string, any> | Record<string, any>[];
}

export default function SchemaMarkup({ schema }: SchemaMarkupProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Pre-defined schemas for various testing tools to keep things DRY and fast
export function getDiagnosticsSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CamMicTest.com - Free Webcam & Mic Test Online",
    "url": "https://cammictest.com",
    "description": "Free, browser-based diagnostic utility to test your webcam, microphone, speakers, and internet connection instantly without software installation.",
    "applicationCategory": "Utility",
    "operatingSystem": "All",
    "browserRequirements": "Requires HTML5, WebRTC, MediaDevices API, and Web Audio API support.",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    }
  };
}

export function getFAQSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };
}
