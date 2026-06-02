"use client";

import React from "react";

interface SpeedometerProps {
  speed: number;
  stage: "idle" | "ping" | "download" | "upload" | "complete" | "error";
  ping: number;
  jitter: number;
  downloadSpeed: number;
  uploadSpeed: number;
  progress: number;
}

export default function Speedometer({
  speed,
  stage,
  ping,
  jitter,
  downloadSpeed,
  uploadSpeed,
  progress,
}: SpeedometerProps) {
  const maxScale = 500;
  
  // Calculate percentage for horizontal bar
  const calculatePercent = (s: number) => {
    if (s <= 0) return 0;
    if (s >= maxScale) return 100;
    // Logarithmic scale for better low-speed resolution
    return (Math.log10(s + 1) / Math.log10(maxScale + 1)) * 100;
  };

  const speedPercent = calculatePercent(speed);

  return (
    <div className="w-full max-w-xl mx-auto py-10 space-y-12 bg-background border border-border rounded-xl p-8 select-none transition-editorial">
      
      {/* Huge Editorial Speed Reading */}
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
          {stage === "idle" ? "Ready to test" : stage === "complete" ? "Test complete" : `${stage}ing`}
        </span>
        
        <div className="flex items-baseline justify-center gap-1.5 font-mono">
          <span className="text-6xl md:text-8xl font-extralight tracking-tighter text-foreground">
            {stage === "ping" ? "---" : speed.toFixed(1)}
          </span>
          <span className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
            Mbps
          </span>
        </div>
      </div>

      {/* Horizontal Instrument Meter Bar */}
      <div className="space-y-2.5">
        <div className="relative w-full h-1 bg-border rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-foreground transition-all duration-150 ease-out"
            style={{ width: `${stage === "download" || stage === "upload" ? speedPercent : 0}%` }}
          />
        </div>
        
        {/* Scale labels */}
        <div className="flex justify-between font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
          <span>0</span>
          <span>10</span>
          <span>50</span>
          <span>100</span>
          <span>250</span>
          <span>500+</span>
        </div>
      </div>

      {/* Grid Table for exact metric values */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border divide-y md:divide-y-0 md:divide-x divide-border rounded-lg overflow-hidden text-center font-mono">
        <div className="py-4 space-y-1 bg-muted/20">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Ping</div>
          <div className="text-base font-medium text-foreground">
            {ping > 0 ? `${Math.round(ping)} ms` : "---"}
          </div>
        </div>

        <div className="py-4 space-y-1 bg-muted/20">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Jitter</div>
          <div className="text-base font-medium text-foreground">
            {jitter > 0 ? `${Math.round(jitter)} ms` : "---"}
          </div>
        </div>

        <div className="py-4 space-y-1">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Download</div>
          <div className="text-base font-medium text-foreground">
            {downloadSpeed > 0 ? `${downloadSpeed.toFixed(1)} Mb/s` : "---"}
          </div>
        </div>

        <div className="py-4 space-y-1">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Upload</div>
          <div className="text-base font-medium text-foreground">
            {uploadSpeed > 0 ? `${uploadSpeed.toFixed(1)} Mb/s` : "---"}
          </div>
        </div>
      </div>
    </div>
  );
}
