"use client";

import React, { useEffect } from "react";

interface AdSlotProps {
  id?: string;
  className?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
}

export default function AdSlot({
  id = "default-ad-slot",
  className = "",
  format = "auto",
  responsive = true,
}: AdSlotProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        if (adsbygoogle.length >= 0) {
          adsbygoogle.push({});
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  let aspectStyle = "h-20 w-full";
  if (format === "vertical") {
    aspectStyle = "h-[450px] w-64";
  } else if (format === "rectangle") {
    aspectStyle = "h-48 w-64";
  } else if (format === "horizontal") {
    aspectStyle = "h-16 w-full";
  }

  return (
    <div className={`my-8 flex flex-col items-center justify-center ${className} select-none`}>
      <span className="text-[8px] uppercase font-semibold text-muted-foreground tracking-widest mb-1.5">
        Advertisement
      </span>

      <div className={`relative flex items-center justify-center bg-muted/20 border border-border overflow-hidden rounded ${aspectStyle}`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "100%" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot={id}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center pointer-events-none">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            Ad placement ready
          </span>
        </div>
      </div>
    </div>
  );
}
