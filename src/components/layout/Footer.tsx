"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="w-full bg-background border-t border-border/60 py-16 transition-editorial mt-24">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Diagnostic info (No Logo Needed) */}
          <div className="space-y-4">
            <span className="font-mono text-[9px] uppercase tracking-widest font-bold text-foreground block">
              DIAGNOSTICS SUITE
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[200px]">
              A free online browser utility verifying video cameras, audio sensors, stereo channels, and connection throughput.
            </p>
            <div className="pt-2 border-l border-border pl-3">
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                All streams are processed in-memory locally. Nothing is ever saved or transmitted.
              </p>
            </div>
          </div>

          {/* Links: Tools */}
          <div>
            <h4 className="text-[11px] font-semibold text-foreground uppercase tracking-widest mb-4">
              Diagnostics
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/webcam-test" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                  Webcam test
                </Link>
              </li>
              <li>
                <Link href="/microphone-test" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                  Microphone test
                </Link>
              </li>
              <li>
                <Link href="/speaker-test" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                  Speaker audio test
                </Link>
              </li>
              <li>
                <Link href="/speed-test" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                  Internet speed test
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Resources */}
          <div>
            <h4 className="text-[11px] font-semibold text-foreground uppercase tracking-widest mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/faq" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                  Frequently asked questions
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                  Diagnostics blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                  Contact support
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter signup */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold text-foreground uppercase tracking-widest mb-4">
              Subscribe
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[220px]">
              Receive browser hardware support alerts and hardware maintenance tutorials.
            </p>
            
            {subscribed ? (
              <div className="text-[11px] text-foreground font-medium">
                ✓ You are subscribed.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2 max-w-[240px]">
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border border-border text-[11px] px-3.5 py-2.5 rounded focus:outline-none focus:border-foreground text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="border border-foreground bg-foreground text-background text-[10px] font-medium uppercase tracking-wider py-2.5 rounded hover:bg-transparent hover:text-foreground transition-colors"
                >
                  Submit
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright segment */}
        <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground select-none">
          <p>
            &copy; {new Date().getFullYear()} cammictest.com. Processing is run locally on the client.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <span>&middot;</span>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <span>&middot;</span>
            <Link href="/sitemap.xml" className="hover:text-foreground transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
