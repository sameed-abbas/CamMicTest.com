"use client";

import React, { useState } from "react";
import { FileText, Image, Copy, Check, Share2 } from "lucide-react";

export default function ExportToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const handlePrintPDF = () => {
    window.print();
    setIsOpen(false);
  };

  const handleCaptureScreenshot = async () => {
    setCapturing(true);
    setIsOpen(false);
    
    try {
      // Import html2canvas dynamically on client to optimize initial bundle size
      const html2canvas = (await import("html2canvas")).default;
      
      // Target specific diagnostic container, otherwise fall back to main body
      const target = document.getElementById("diagnostic-content") || document.querySelector("main") || document.body;
      
      // Temporarily hide the floating toolbar and headers during capture
      const toolbar = document.querySelector(".floating-toolbar");
      const header = document.querySelector("header");
      const footer = document.querySelector("footer");
      
      if (toolbar) toolbar.classList.add("opacity-0");
      if (header) header.classList.add("opacity-0");
      if (footer) footer.classList.add("opacity-0");
      
      // Generate the canvas
      const canvas = await html2canvas(target as HTMLElement, {
        backgroundColor: document.documentElement.classList.contains("dark") ? "#000000" : "#ffffff",
        scale: 2, // Double resolution for retina quality screenshot
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      // Restore elements visibility
      if (toolbar) toolbar.classList.remove("opacity-0");
      if (header) header.classList.remove("opacity-0");
      if (footer) footer.classList.remove("opacity-0");
      
      // Trigger downlaod
      const link = document.createElement("a");
      link.download = `cammictest-report-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Screenshot capture failed:", err);
    } finally {
      setCapturing(false);
    }
  };

  const handleCopyLog = () => {
    let reportText = `CamMicTest.com - Diagnostic Report\nGenerated: ${new Date().toLocaleString()}\n`;
    
    // Grab specs, device logs, and speed parameters dynamically
    const specItems = document.querySelectorAll(".grid-cols-3, table, .font-mono text-base");
    specItems.forEach((element) => {
      if (element.textContent) {
        reportText += `\n- ${element.textContent.trim().replace(/\s+/g, " ")}`;
      }
    });
    
    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setIsOpen(false);
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 no-print floating-toolbar transition-apple-spring">
      {/* Popover options panel */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-52 bg-card border border-border rounded-xl shadow-xl p-2 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="px-3 py-1.5 border-b border-border/40 mb-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
              Export report
            </span>
          </div>
          
          <button
            onClick={handlePrintPDF}
            className="w-full flex items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 px-2.5 py-2 rounded text-left transition-colors font-mono"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" /> Download PDF / Print
          </button>
          
          <button
            onClick={handleCaptureScreenshot}
            className="w-full flex items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 px-2.5 py-2 rounded text-left transition-colors font-mono"
          >
            <Image className="w-3.5 h-3.5 text-emerald-500" /> Save Screenshot
          </button>
          
          <button
            onClick={handleCopyLog}
            className="w-full flex items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 px-2.5 py-2 rounded text-left transition-colors font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-amber-500" />}
            {copied ? "Copied Log!" : "Copy Report Log"}
          </button>
        </div>
      )}

      {/* Main trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={capturing}
        className={`w-12 h-12 rounded-full border border-border shadow-lg flex items-center justify-center transition-apple-spring hover-apple-lift ${
          isOpen ? "bg-foreground text-background border-foreground" : "bg-card text-foreground"
        }`}
        aria-label="Export diagnostic report options"
      >
        {capturing ? (
          <span className="w-3.5 h-3.5 border-2 border-muted border-t-foreground rounded-full animate-spin" />
        ) : (
          <Share2 className="w-4 h-4 text-foreground/80 group-hover:text-foreground" />
        )}
      </button>
    </div>
  );
}
