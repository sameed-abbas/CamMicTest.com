"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type SpeedTestStage = "idle" | "ping" | "download" | "upload" | "complete" | "error";

export interface SpeedTestResult {
  id: string;
  timestamp: string;
  ping: number;
  jitter: number;
  download: number;
  upload: number;
}

export function useSpeedTest() {
  const [stage, setStage] = useState<SpeedTestStage>("idle");
  const [ping, setPing] = useState<number>(0);
  const [jitter, setJitter] = useState<number>(0);
  const [downloadSpeed, setDownloadSpeed] = useState<number>(0);
  const [uploadSpeed, setUploadSpeed] = useState<number>(0);
  const [activeSpeed, setActiveSpeed] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [history, setHistory] = useState<SpeedTestResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Refs for background values to avoid massive React re-renders during high-frequency stream updates
  const pingRef = useRef<number>(0);
  const jitterRef = useRef<number>(0);
  const downloadSpeedRef = useRef<number>(0);
  const uploadSpeedRef = useRef<number>(0);
  const activeSpeedRef = useRef<number>(0);
  const progressRef = useRef<number>(0);

  const activeTestRef = useRef<boolean>(false);
  const xhrsRef = useRef<XMLHttpRequest[]>([]);
  const abortControllersRef = useRef<AbortController[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cammictest_speed_history");
      if (stored) {
        try {
          setHistory(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Sync refs to React state at a throttled rate (100ms) to ensure smooth animations and peak performance
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (stage !== "idle" && stage !== "complete" && stage !== "error") {
      interval = setInterval(() => {
        setPing(pingRef.current);
        setJitter(jitterRef.current);
        setDownloadSpeed(downloadSpeedRef.current);
        setUploadSpeed(uploadSpeedRef.current);
        setActiveSpeed(activeSpeedRef.current);
        setProgress(progressRef.current);
      }, 100);
    } else {
      // Final sync when state changes to idle, complete, or error
      setPing(pingRef.current);
      setJitter(jitterRef.current);
      setDownloadSpeed(downloadSpeedRef.current);
      setUploadSpeed(uploadSpeedRef.current);
      setActiveSpeed(activeSpeedRef.current);
      setProgress(progressRef.current);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stage]);

  const saveResult = useCallback((pingVal: number, jitterVal: number, downVal: number, upVal: number) => {
    const newResult: SpeedTestResult = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleString(),
      ping: Math.round(pingVal * 10) / 10,
      jitter: Math.round(jitterVal * 10) / 10,
      download: Math.round(downVal * 100) / 100,
      upload: Math.round(upVal * 100) / 100,
    };

    setHistory((prev) => {
      const updated = [newResult, ...prev].slice(0, 50);
      localStorage.setItem("cammictest_speed_history", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const cancelTest = useCallback(() => {
    activeTestRef.current = false;
    
    xhrsRef.current.forEach((xhr) => xhr.abort());
    xhrsRef.current = [];

    abortControllersRef.current.forEach((controller) => controller.abort());
    abortControllersRef.current = [];

    pingRef.current = 0;
    jitterRef.current = 0;
    downloadSpeedRef.current = 0;
    uploadSpeedRef.current = 0;
    activeSpeedRef.current = 0;
    progressRef.current = 0;

    setStage("idle");
  }, []);

  const startTest = useCallback(async () => {
    if (activeTestRef.current) return;
    activeTestRef.current = true;
    setError(null);

    pingRef.current = 0;
    jitterRef.current = 0;
    downloadSpeedRef.current = 0;
    uploadSpeedRef.current = 0;
    activeSpeedRef.current = 0;
    progressRef.current = 0;

    setStage("ping");

    try {
      // 1. PING & JITTER TEST (Check connection RTT using Cloudflare)
      const pings: number[] = [];
      const pingCount = 10;
      
      for (let i = 0; i < pingCount; i++) {
        if (!activeTestRef.current) return;
        
        const t0 = performance.now();
        const res = await fetch("https://speed.cloudflare.com/__down?bytes=0", { cache: "no-store" });
        if (!res.ok) throw new Error("Connection check failed.");
        await res.text();
        const t1 = performance.now();
        
        const rtt = t1 - t0;
        pings.push(rtt);
        
        const currentPing = pings.reduce((a, b) => a + b, 0) / pings.length;
        pingRef.current = currentPing;
        
        if (pings.length > 1) {
          let diffSum = 0;
          for (let j = 1; j < pings.length; j++) {
            diffSum += Math.abs(pings[j] - pings[j - 1]);
          }
          jitterRef.current = diffSum / (pings.length - 1);
        }

        progressRef.current = Math.round(((i + 1) / pingCount) * 100);
        await new Promise((resolve) => setTimeout(resolve, 80));
      }

      // 2. DOWNLOAD SPEED TEST
      // Adaptive mechanism: Loops of parallel streams fetching 10MB blocks from Cloudflare edge.
      if (!activeTestRef.current) return;
      setStage("download");
      progressRef.current = 0;

      const downloadDurationLimit = 8000; // 8 seconds test window
      const downloadStableStart = 2000; // Discard first 2 seconds of measurements for TCP Slow-Start
      const downloadStart = performance.now();
      
      let downloadedBytes = 0;
      const downloadHistory: { time: number; bytes: number }[] = [];
      const downloadStableSamples: number[] = [];
      let transferStart: number | null = null;

      const progressInterval = setInterval(() => {
        const elapsed = performance.now() - downloadStart;
        const pct = Math.min(Math.round((elapsed / downloadDurationLimit) * 100), 100);
        progressRef.current = pct;
      }, 100);

      const downloadThreadsCount = 4;
      const downloadPromises = Array.from({ length: downloadThreadsCount }).map(async () => {
        const chunkSize = 10000000; // 10MB chunk (fully supported by Cloudflare edge)
        
        while (activeTestRef.current) {
          const now = performance.now();
          if (now - downloadStart >= downloadDurationLimit) break;

          const controller = new AbortController();
          abortControllersRef.current.push(controller);

          try {
            const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${chunkSize}`, {
              cache: "no-store",
              signal: controller.signal,
            });

            if (!response.ok || !response.body) {
              throw new Error("Download server error.");
            }

            const reader = response.body.getReader();
            
            while (activeTestRef.current) {
              const currentNow = performance.now();
              if (currentNow - downloadStart >= downloadDurationLimit) {
                reader.cancel();
                break;
              }

              const { done, value } = await reader.read();
              if (value) {
                if (transferStart === null) {
                  transferStart = performance.now();
                }
                
                downloadedBytes += value.length;
                const updateNow = performance.now();
                
                // Track rolling window speed (instantaneous throughput over last 1.5 seconds)
                downloadHistory.push({ time: updateNow, bytes: downloadedBytes });
                
                const cutoff = updateNow - 1500;
                while (downloadHistory.length > 0 && downloadHistory[0].time < cutoff) {
                  downloadHistory.shift();
                }

                if (downloadHistory.length >= 2) {
                  const first = downloadHistory[0];
                  const last = downloadHistory[downloadHistory.length - 1];
                  const dt = (last.time - first.time) / 1000;
                  const db = last.bytes - first.bytes;
                  
                  if (dt > 0.1) {
                    const currentSpeed = (db * 8) / dt / 1000000; // in Mbps
                    activeSpeedRef.current = currentSpeed;
                    
                    // Only collect stable samples for final average after ramp-up period
                    if (updateNow - transferStart > downloadStableStart) {
                      downloadStableSamples.push(currentSpeed);
                    }
                    
                    downloadSpeedRef.current = currentSpeed;
                  }
                }
              }

              if (done) break;
            }
          } catch (err) {
            // Ignore abort error
            if (err instanceof DOMException && err.name === "AbortError") {
              break;
            }
            throw err;
          } finally {
            abortControllersRef.current = abortControllersRef.current.filter(c => c !== controller);
          }
        }
      });

      try {
        await Promise.all(downloadPromises);
      } catch (err) {
        // Ignore aborted errors
      }

      clearInterval(progressInterval);
      abortControllersRef.current.forEach(c => c.abort());
      abortControllersRef.current = [];

      // Calculate final average download speed
      if (downloadStableSamples.length > 0) {
        const finalDownload = downloadStableSamples.reduce((a, b) => a + b, 0) / downloadStableSamples.length;
        downloadSpeedRef.current = finalDownload;
      } else if (downloadSpeedRef.current === 0 && downloadedBytes > 0) {
        const elapsed = (performance.now() - (transferStart || downloadStart)) / 1000;
        downloadSpeedRef.current = (downloadedBytes * 8) / elapsed / 1000000;
      }
      activeSpeedRef.current = 0;

      // 3. UPLOAD SPEED TEST
      // Adaptive mechanism: Loops of parallel POST requests uploading dynamically sized buffers to Cloudflare edge.
      // Wrap payloads in a text/plain Blob to keep the request "simple", bypassing CORS preflight (OPTIONS) blocks.
      if (!activeTestRef.current) return;
      setStage("upload");
      progressRef.current = 0;

      const uploadDurationLimit = 8000; // 8 seconds test window
      const uploadStableStart = 2000; // Discard first 2 seconds for TCP ramp-up
      const uploadStart = performance.now();
      
      let uploadedBytes = 0;
      const uploadStableSamples: number[] = [];
      let uploadTransferStart: number | null = null;

      const uploadProgressInterval = setInterval(() => {
        const elapsed = performance.now() - uploadStart;
        const pct = Math.min(Math.round((elapsed / uploadDurationLimit) * 100), 100);
        progressRef.current = pct;
      }, 100);

      // Determine upload chunk size dynamically based on measured download speed for responsiveness & saturation
      let dynamicChunkSize = 1000000; // Default 1MB
      if (downloadSpeedRef.current < 5) {
        dynamicChunkSize = 200000; // 200KB for slow connections
      } else if (downloadSpeedRef.current < 25) {
        dynamicChunkSize = 1000000; // 1MB for medium-slow connections
      } else if (downloadSpeedRef.current < 100) {
        dynamicChunkSize = 2000000; // 2MB for medium-fast connections
      } else {
        dynamicChunkSize = 5000000; // 5MB for fast connections
      }

      const uploadThreadsCount = 3;
      const rawChunk = new Uint8Array(dynamicChunkSize);
      // We wrap the data in a Blob with a simple Content-Type to avoid triggering OPTIONS preflight requests
      const uploadBlob = new Blob([rawChunk], { type: "text/plain" });

      const uploadPromises = Array.from({ length: uploadThreadsCount }).map(async () => {
        while (activeTestRef.current) {
          const now = performance.now();
          if (now - uploadStart >= uploadDurationLimit) break;

          const controller = new AbortController();
          abortControllersRef.current.push(controller);

          const t0 = performance.now();
          try {
            const response = await fetch("https://speed.cloudflare.com/__up", {
              method: "POST",
              headers: {
                "Content-Type": "text/plain",
              },
              body: uploadBlob,
              mode: "cors",
              cache: "no-store",
              signal: controller.signal,
            });

            if (response.ok) {
              const t1 = performance.now();
              if (uploadTransferStart === null) {
                uploadTransferStart = t0;
              }

              const elapsedChunk = t1 - t0;
              if (elapsedChunk > 0) {
                uploadedBytes += dynamicChunkSize;
                const updateNow = performance.now();

                // Compute speed for this specific chunk
                const chunkSpeed = (dynamicChunkSize * 8) / (elapsedChunk / 1000) / 1000000;
                
                // Compute running average speed
                const elapsedTotal = (updateNow - uploadTransferStart) / 1000;
                const currentSpeed = (uploadedBytes * 8) / elapsedTotal / 1000000;

                activeSpeedRef.current = currentSpeed;

                if (updateNow - uploadTransferStart > uploadStableStart) {
                  uploadStableSamples.push(chunkSpeed);
                }

                uploadSpeedRef.current = currentSpeed;
              }
            } else {
              throw new Error("Upload response not OK");
            }
          } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") {
              break;
            }
            console.error("Upload chunk error:", err);
            // Wait brief moment on error to prevent CPU spin
            await new Promise((r) => setTimeout(r, 100));
            break;
          } finally {
            abortControllersRef.current = abortControllersRef.current.filter((c) => c !== controller);
          }
        }
      });

      try {
        await Promise.all(uploadPromises);
      } catch (err) {
        // Ignore aborted errors
      }

      clearInterval(uploadProgressInterval);
      abortControllersRef.current.forEach((c) => c.abort());
      abortControllersRef.current = [];

      // Calculate final average upload speed
      if (uploadStableSamples.length > 0) {
        const finalUpload = uploadStableSamples.reduce((a, b) => a + b, 0) / uploadStableSamples.length;
        uploadSpeedRef.current = finalUpload;
      } else if (uploadSpeedRef.current === 0 && uploadedBytes > 0) {
        const elapsed = (performance.now() - (uploadTransferStart || uploadStart)) / 1000;
        uploadSpeedRef.current = (uploadedBytes * 8) / elapsed / 1000000;
      }
      activeSpeedRef.current = 0;

      // Complete & Save Results
      saveResult(pingRef.current, jitterRef.current, downloadSpeedRef.current, uploadSpeedRef.current);
      setStage("complete");
      progressRef.current = 100;
      activeTestRef.current = false;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Internet speed test failed.");
      setStage("error");
      activeTestRef.current = false;
    }
  }, [saveResult]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("cammictest_speed_history");
    }
  }, []);

  return {
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
    clearHistory,
  };
}
