"use client";

import React, { useState } from "react";
import { useSpeedTest } from "@/hooks/useSpeedTest";
import Speedometer from "@/components/diagnostics/Speedometer";
import SchemaMarkup, { getFAQSchema } from "@/components/seo/SchemaMarkup";
import AdSlot from "@/components/layout/AdSlot";
import AffiliateRecommendations from "@/components/layout/AffiliateRecommendations";
import { 
  Trash2, 
  Clock,
  Activity,
  Wifi,
  HardDrive,
  RefreshCw,
  ChevronDown
} from "lucide-react";

const SPEEDTEST_FAQS = [
  {
    q: "Why is an accurate speed test important for video calls?",
    a: "Video conferencing platforms like Zoom and Microsoft Teams require stable bandwidth and low latency. For HD video calls, a minimum download and upload speed of 3-5 Mbps is recommended. However, latency (ping) and stability (jitter) are even more critical. A ping under 50ms and jitter under 10ms are ideal for smooth voice and video synchronization."
  },
  {
    q: "How does this speed test achieve Fast.com-level accuracy?",
    a: "Our speed test saturates your network pipe using multi-threaded parallel downloads and uploads directly to Cloudflare CDN edge nodes. By bypassing slow TCP warm-up phases and DNS lookup delays, it measures your maximum connection capability, mirroring the methodology used by Netflix's Fast.com."
  },
  {
    q: "What do download speed and upload speed represent?",
    a: "Download speed is the rate at which files, web pages, and streams load from the internet to your device. Upload speed is the rate at which you send files, videos, or voice data from your machine back to the web. Both are measured in Megabits per second (Mbps)."
  },
  {
    q: "What are ping and jitter, and how do they affect gaming?",
    a: "Ping is the round-trip reaction time of your connection, measured in milliseconds (ms); lower is better. Jitter measures the variance in ping times over a period. High jitter leads to packet loss and lagging, which causes stuttering during online gaming or VoIP calls."
  },
  {
    q: "How do VPNs and ad-blockers affect my speed test results?",
    a: "VPNs route your traffic through remote servers, which encrypts your data and often increases latency (higher ping) and limits throughput (lower download/upload speeds). Similarly, strict local firewalls or ad-blockers can intercept web socket requests, skewing the test results. Disable them for a raw speed check."
  }
];

export default function SpeedTestPage() {
  const {
    stage,
    ping,
    jitter,
    downloadSpeed,
    uploadSpeed,
    activeSpeed,
    progress,
    history,
    error,
    startTest,
    cancelTest,
    clearHistory
  } = useSpeedTest();

  const isRunning = stage !== "idle" && stage !== "complete" && stage !== "error";
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div id="diagnostic-content" className="space-y-16 select-none py-6 animate-apple-reveal">
      <SchemaMarkup schema={getFAQSchema(SPEEDTEST_FAQS)} />

      {/* Editorial Title */}
      <section className="space-y-3 max-w-xl">
        <span className="font-mono text-[10px] uppercase tracking-widest font-semibold text-muted-foreground block">
          Calibration tool
        </span>
        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-foreground">
          Internet Speed Test
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          Measure latency ping rates, trace signal jitter, and calculate download and upload connection speed.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Main check container */}
        <div className="lg:col-span-2 space-y-8 flex flex-col items-center">
          
          <Speedometer
            speed={stage === "download" || stage === "upload" ? activeSpeed : stage === "complete" ? downloadSpeed : 0}
            stage={stage}
            ping={ping}
            jitter={jitter}
            downloadSpeed={downloadSpeed}
            uploadSpeed={uploadSpeed}
            progress={progress}
          />

          {/* Wireframe triggers */}
          <div className="w-full max-w-xl">
            {isRunning ? (
              <button
                onClick={cancelTest}
                className="w-full py-4 border border-destructive text-destructive hover:bg-destructive/5 font-mono text-xs uppercase tracking-wider rounded transition-apple-spring"
              >
                Abort Speed Test
              </button>
            ) : (
              <button
                onClick={startTest}
                className="w-full py-4 border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground font-mono text-xs uppercase tracking-wider rounded transition-apple-spring"
              >
                Start Calibration
              </button>
            )}
          </div>

          {/* Errors display */}
          {error && (
            <div className="w-full max-w-xl p-4 border border-destructive/30 text-destructive text-xs rounded bg-destructive/5 animate-pulse">
              ⚠️ {error}
            </div>
          )}

          {/* Monospace History logs */}
          {history.length > 0 && (
            <div className="w-full max-w-xl border border-border rounded-xl p-6 space-y-4 transition-apple-spring hover-apple-lift">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="font-mono text-[9px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Historical check logs
                </span>
                <button
                  onClick={clearHistory}
                  className="font-mono text-[9px] text-destructive hover:underline uppercase flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear log
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-border/30 text-muted-foreground text-[9px] uppercase tracking-wider">
                      <th className="py-2.5">Timestamp</th>
                      <th className="py-2.5">Ping</th>
                      <th className="py-2.5">Jitter</th>
                      <th className="py-2.5">Download</th>
                      <th className="py-2.5">Upload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record) => (
                      <tr key={record.id} className="border-b border-border/20 text-foreground/85 hover:bg-muted/30 transition-colors">
                        <td className="py-3 text-[10px] text-muted-foreground">{record.timestamp}</td>
                        <td className="py-3">{record.ping} ms</td>
                        <td className="py-3">{record.jitter} ms</td>
                        <td className="py-3 font-semibold">{record.download.toFixed(1)} Mb/s</td>
                        <td className="py-3 font-semibold">{record.upload.toFixed(1)} Mb/s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          <AdSlot id="speed-minimal-sidebar" format="rectangle" />

          <div className="p-6 border border-border rounded-xl space-y-4 transition-apple-spring hover-apple-lift">
            <h3 className="font-medium text-sm text-foreground">Internet Speed Index</h3>
            <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong>Excellent (100+ Mb/s):</strong> Instant capacities, accommodating multiple concurrency 4K streaming feeds and high-frame teleconferences.
              </p>
              <p>
                <strong>Good (25 - 99 Mb/s):</strong> Standard office capacity. Easily handles normal video checks and standard file syncing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: TECHNICAL PERFORMANCE BREAKDOWN */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <span className="font-mono text-[9px] uppercase tracking-widest font-semibold text-muted-foreground block">
            01 / Metric Details
          </span>
          <h2 className="text-xl font-light text-foreground">
            Performance Breakdown
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Understand the physical metrics measured during network speed calibration and why they matter for streaming and communication.
          </p>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 border border-border rounded-xl space-y-3 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground font-mono">
              <Activity className="w-3.5 h-3.5 text-muted-foreground" />
              <h4 className="font-medium text-xs uppercase tracking-wider">Latency & Stability</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Ping (ms):</strong> The time it takes for a packet of data to travel from your browser to Cloudflare's server and back. Lower latency (below 30ms) is crucial for real-time video calls and online gaming.<br />
              <strong>Jitter (ms):</strong> The variance in ping latency over time. Low jitter (under 5ms) ensures a steady stream of data, avoiding abrupt voice freezes.
            </p>
          </div>

          <div className="p-6 border border-border rounded-xl space-y-3 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground font-mono">
              <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
              <h4 className="font-medium text-xs uppercase tracking-wider">Sustained Throughput</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Download Speed (Mb/s):</strong> The rate at which your connection retrieves binary dummy packages from edge nodes. Determines how fast web pages load and video feeds render.<br />
              <strong>Upload Speed (Mb/s):</strong> The speed at which your device sends data to the internet. Important for sending your high-def camera feed, screensharing, or cloud syncing.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: NETWORK TROUBLESHOOTING BLUEPRINT */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <span className="font-mono text-[9px] uppercase tracking-widest font-semibold text-muted-foreground block">
            02 / Diagnostics
          </span>
          <h2 className="text-xl font-light text-foreground">
            ISP Troubleshooting Blueprint
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Steps to take if your internet speed is slower than expected or your connection drops.
          </p>
        </div>

        <div className="md:col-span-2 space-y-4 font-mono text-xs">
          <div className="p-5 border border-border rounded-xl space-y-2 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground text-[10px] uppercase font-bold tracking-wider">
              <Wifi className="w-3.5 h-3.5 text-muted-foreground inline" /> 1. Wi-Fi Range vs Wired Ethernet
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
              Wi-Fi signals degrade significantly through walls and floors. If speeds are lower than contracted, connect your machine directly to your router using a Cat6 Ethernet cable, or move closer to the wireless router to eliminate local radio frequency interference.
            </p>
          </div>

          <div className="p-5 border border-border rounded-xl space-y-2 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground text-[10px] uppercase font-bold tracking-wider">
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground inline" /> 2. Router & Modem Recalibration
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
              Local routing tables and cache on home modems can get congested over time. Power down your modem and router for 30 seconds, restart them, and allow 2 minutes for a clean handshake with your Internet Service Provider (ISP).
            </p>
          </div>

          <div className="p-5 border border-border rounded-xl space-y-2 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground text-[10px] uppercase font-bold tracking-wider">
              <HardDrive className="w-3.5 h-3.5 text-muted-foreground inline" /> 3. Disable Conflicting Background Apps
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
              Ensure there are no ongoing active downloads, cloud synchronizations (OneDrive, iCloud, Google Drive), VPNs, ad-blockers, or browser extensions streaming media in the background. These consume capacity and skew speed test results.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: BROWSER SPEED TEST FAQS */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">Help docs</span>
          <h2 className="text-2xl font-light tracking-tight text-foreground">Speed Test Help FAQs</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
            Frequently asked questions about internet bandwidth, download/upload speeds, and latency.
          </p>
        </div>

        <div className="md:col-span-2 divide-y divide-border/60">
          {SPEEDTEST_FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="py-4 first:pt-0 last:pb-0">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs font-semibold text-foreground py-2 hover:opacity-85"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-185" : ""}`} />
                </button>
                {isOpen && (
                  <div className="pt-2 pb-3 text-xs text-muted-foreground leading-relaxed animate-in slide-in-from-top-1 duration-200 max-w-xl">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Network suggestions */}
      <AffiliateRecommendations category="network" />
    </div>
  );
}
