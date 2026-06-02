"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import AdSlot from "@/components/layout/AdSlot";
import AffiliateRecommendations from "@/components/layout/AffiliateRecommendations";
import { 
  Printer, 
  RefreshCw, 
  AlertTriangle
} from "lucide-react";

interface ReportData {
  timestamp: string;
  browser: string;
  os: string;
  screenResolution: string;
  webcam: {
    status: "pass" | "fail" | null;
    name: string;
    resolution: string;
  };
  microphone: {
    status: "pass" | "fail" | null;
    name: string;
  };
  speaker: {
    status: "pass" | "fail" | null;
  };
  network: {
    ping: number;
    jitter: number;
    download: number;
    upload: number;
  };
}

export default function ResultsPage() {
  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cammictest_last_report");
      if (stored) {
        try {
          setReport(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!report) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6 select-none font-mono">
        <AlertTriangle className="w-6 h-6 mx-auto text-muted-foreground" />
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">No Scan Data Found</h2>
          <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Please run the complete device check sequence first to generate a system report card.
          </p>
        </div>
        <Link
          href="/device-check"
          className="w-full inline-flex items-center justify-center border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground text-[10px] font-medium tracking-wider uppercase py-3.5 rounded transition-colors"
        >
          Run Diagnostics Scan
        </Link>
      </div>
    );
  }

  // Calculate score
  let score = 0;
  if (report.webcam.status === "pass") score += 25;
  if (report.microphone.status === "pass") score += 25;
  if (report.speaker.status === "pass") score += 25;
  
  if (report.network.download >= 25) {
    score += 25;
  } else if (report.network.download > 0) {
    score += Math.round((report.network.download / 25) * 25);
  }

  let grade = "Excellent";
  let gradeColor = "text-foreground";
  if (score < 50) {
    grade = "Issues Detected";
    gradeColor = "text-destructive";
  } else if (score < 85) {
    grade = "Caution / Warn";
    gradeColor = "text-warning";
  }

  return (
    <div id="diagnostic-content" className="space-y-12 max-w-3xl mx-auto print:py-0 print:space-y-8 select-none py-6">
      <SchemaMarkup
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "System Calibration Log - CamMicTest.com",
          "description": "Generated system report detailing camera, acoustic sensor, stereo audio, and internet connection speed.",
        }}
      />

      {/* Title block */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6 print:border-b">
        <div className="space-y-1">
          <span className="font-mono text-[9px] uppercase tracking-widest font-semibold text-muted-foreground block">Diagnostics report</span>
          <h1 className="text-3xl font-light tracking-tight text-foreground">
            Calibration Logs
          </h1>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            Scanned on {report.timestamp} &middot; Browser: {report.browser} ({report.os})
          </p>
        </div>

        {/* Print controls */}
        <div className="flex gap-2.5 shrink-0 print:hidden font-mono text-[10px]">
          <button
            onClick={handlePrint}
            className="border border-border text-foreground hover:border-foreground uppercase tracking-wider px-4 py-2.5 rounded transition-colors"
          >
            <Printer className="w-3.5 h-3.5 inline mr-1" /> Save PDF
          </button>
          <Link
            href="/device-check"
            className="border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground uppercase tracking-wider px-4 py-2.5 rounded transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Re-scan
          </Link>
        </div>
      </section>

      {/* Monospace Instrument Scorecard Banner */}
      <section className="border border-border rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 bg-muted/10 font-mono">
        <div className="w-24 h-24 flex flex-col items-center justify-center shrink-0 border border-border rounded-full bg-background">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground block mb-0.5">Rating</span>
          <span className="text-3xl font-extralight text-foreground">{score}</span>
        </div>

        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="text-[9px] uppercase tracking-widest font-semibold text-muted-foreground">Evaluation status</div>
          <div className={`text-xl font-bold tracking-tight uppercase ${gradeColor}`}>
            {grade}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed font-sans max-w-md">
            This metric outlines your machine's hardware and network speed configurations for web teleconferencing and browser sandboxed streaming.
          </p>
        </div>
      </section>

      {/* Detailed results tables (instead of cards) */}
      <section className="space-y-6 font-mono text-xs">
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block border-b border-border/40 pb-2">Device telemetry details</span>
        
        <div className="border border-border divide-y divide-border rounded-lg overflow-hidden">
          
          {/* Webcam row */}
          <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center bg-card">
            <span className="font-semibold text-foreground">Camera Sensor</span>
            <span className="sm:col-span-2 text-muted-foreground truncate">{report.webcam.name} &middot; {report.webcam.resolution}</span>
            <span className="text-right sm:text-right">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                report.webcam.status === "pass" ? "border-success/20 text-success bg-success/5" : "border-destructive/20 text-destructive bg-destructive/5"
              }`}>
                {report.webcam.status === "pass" ? "Passed" : "Failed"}
              </span>
            </span>
          </div>

          {/* Microphone row */}
          <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center bg-card">
            <span className="font-semibold text-foreground">Microphone Input</span>
            <span className="sm:col-span-2 text-muted-foreground truncate">{report.microphone.name}</span>
            <span className="text-right sm:text-right">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                report.microphone.status === "pass" ? "border-success/20 text-success bg-success/5" : "border-destructive/20 text-destructive bg-destructive/5"
              }`}>
                {report.microphone.status === "pass" ? "Passed" : "Failed"}
              </span>
            </span>
          </div>

          {/* Speaker row */}
          <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center bg-card">
            <span className="font-semibold text-foreground">Speaker Channels</span>
            <span className="sm:col-span-2 text-muted-foreground">Stereo sound check panning</span>
            <span className="text-right sm:text-right">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                report.speaker.status === "pass" ? "border-success/20 text-success bg-success/5" : "border-destructive/20 text-destructive bg-destructive/5"
              }`}>
                {report.speaker.status === "pass" ? "Passed" : "Failed"}
              </span>
            </span>
          </div>

          {/* Speed test row */}
          <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center bg-card">
            <span className="font-semibold text-foreground">Internet Speed</span>
            <span className="sm:col-span-2 text-muted-foreground">
              Down: {report.network.download.toFixed(1)} Mbps &middot; Up: {report.network.upload.toFixed(1)} Mbps &middot; Latency: {Math.round(report.network.ping)}ms
            </span>
            <span className="text-right sm:text-right">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                report.network.download >= 15 ? "border-success/20 text-success bg-success/5" : "border-destructive/20 text-destructive bg-destructive/5"
              }`}>
                {report.network.download >= 15 ? "Stable" : "Slow"}
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Troubleshooting guide */}
      {score < 100 && (
        <section className="p-6 border border-border rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Troubleshooting Steps</h3>
          <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
            {report.webcam.status !== "pass" && (
              <p>
                🎥 <strong>Camera:</strong> Verify the physical lens cover is open. Ensure that browser camera settings block toggles are unblocked.
              </p>
            )}
            {report.microphone.status !== "pass" && (
              <p>
                🎤 <strong>Microphone:</strong> Verify default audio input routing address inside operating system sound panels.
              </p>
            )}
            {report.speaker.status !== "pass" && (
              <p>
                🔊 <strong>Speakers:</strong> Toggle master sound on, adjust headphone panning balances, and check routing cables.
              </p>
            )}
            {report.network.download < 15 && (
              <p>
                📶 <strong>Connection:</strong> Move closer to the wireless access router, or inspect speed using wired Ethernet cabling.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Affiliate recommendations */}
      <div className="print:hidden">
        <AffiliateRecommendations category="all" />
      </div>
    </div>
  );
}
