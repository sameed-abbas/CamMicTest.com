"use client";

import React, { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  type?: "waveform" | "bars";
  isActive?: boolean;
}

export default function AudioVisualizer({
  analyserRef,
  type = "waveform",
  isActive = false,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();

    // Render loop
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Determine drawing color based on dark mode class on html
      const isDark = document.documentElement.classList.contains("dark");
      const drawColor = isDark ? "#ffffff" : "#000000";
      const inactiveColor = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)";

      ctx.clearRect(0, 0, width, height);

      if (!isActive || !analyserRef.current) {
        // Draw flat line
        ctx.strokeStyle = inactiveColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        animationRef.current = requestAnimationFrame(render);
        return;
      }

      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;

      if (type === "waveform") {
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        ctx.strokeStyle = drawColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else {
        // Equalizer Bars Visual (thin lines)
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / (bufferLength * 0.7)) * 1.4;
        let barHeight;
        let x = 0;

        ctx.fillStyle = drawColor;

        for (let i = 0; i < bufferLength * 0.7; i++) {
          barHeight = (dataArray[i] / 255) * height * 0.75;
          const y = height - barHeight;
          
          ctx.beginPath();
          // Draw thin flat rectangles
          ctx.rect(x, y, Math.max(1, barWidth - 3), barHeight);
          ctx.fill();

          x += barWidth;
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [analyserRef, type, isActive]);

  return (
    <div className="w-full h-24 bg-transparent border border-border rounded-lg p-2 overflow-hidden flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
