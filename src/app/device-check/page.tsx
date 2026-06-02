"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSystemDiagnostics } from "@/hooks/useSystemDiagnostics";
import { useWebcam } from "@/hooks/useWebcam";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useSpeaker } from "@/hooks/useSpeaker";
import { useSpeedTest } from "@/hooks/useSpeedTest";
import AudioVisualizer from "@/components/diagnostics/AudioVisualizer";
import Speedometer from "@/components/diagnostics/Speedometer";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import AdSlot from "@/components/layout/AdSlot";
import { 
  Video, 
  Mic, 
  Headphones, 
  Wifi, 
  ChevronRight, 
  RefreshCw,
  Volume2
} from "lucide-react";

type CheckStep = "init" | "webcam" | "microphone" | "speaker" | "speed";

export default function DeviceCheckPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CheckStep>("init");
  
  const [webcamStatus, setWebcamStatus] = useState<"pass" | "fail" | null>(null);
  const [microphoneStatus, setMicrophoneStatus] = useState<"pass" | "fail" | null>(null);
  const [speakerStatus, setSpeakerStatus] = useState<"pass" | "fail" | null>(null);

  const sys = useSystemDiagnostics();
  const cam = useWebcam();
  const mic = useMicrophone();
  const spk = useSpeaker();
  const net = useSpeedTest();

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (currentStep === "webcam" && videoRef.current && cam.stream) {
      videoRef.current.srcObject = cam.stream;
    }
  }, [currentStep, cam.stream]);

  useEffect(() => {
    if (currentStep === "webcam") {
      cam.start();
    } else {
      cam.stop();
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === "microphone") {
      mic.start();
    } else {
      mic.stop();
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep !== "speaker") {
      spk.stop();
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === "speed") {
      net.startTest();
    } else {
      net.cancelTest();
    }
  }, [currentStep]);

  // Handle speed test complete and redirect
  useEffect(() => {
    if (currentStep === "speed" && net.stage === "complete") {
      const report = {
        timestamp: new Date().toLocaleString(),
        browser: sys.system?.browser || "Unknown",
        os: sys.system?.os || "Unknown",
        screenResolution: sys.system?.screenResolution || "Unknown",
        webcam: {
          status: webcamStatus,
          name: cam.activeDevice?.label || "No camera detected",
          resolution: cam.resolution ? `${cam.resolution.width} x ${cam.resolution.height}` : "Unknown",
        },
        microphone: {
          status: microphoneStatus,
          name: mic.activeDevice?.label || "No microphone detected",
        },
        speaker: {
          status: speakerStatus,
        },
        network: {
          ping: net.ping,
          jitter: net.jitter,
          download: net.downloadSpeed,
          upload: net.uploadSpeed,
        }
      };

      localStorage.setItem("cammictest_last_report", JSON.stringify(report));
      router.push("/results");
    }
  }, [
    currentStep,
    net.stage,
    net.ping,
    net.jitter,
    net.downloadSpeed,
    net.uploadSpeed,
    webcamStatus,
    microphoneStatus,
    speakerStatus,
    sys.system,
    cam.activeDevice,
    cam.resolution,
    mic.activeDevice,
    router
  ]);

  const goToWebcam = async () => {
    await sys.requestPermissions("both");
    setCurrentStep("webcam");
  };

  const handleWebcamResult = (passed: boolean) => {
    setWebcamStatus(passed ? "pass" : "fail");
    setCurrentStep("microphone");
  };

  const handleMicrophoneResult = (passed: boolean) => {
    setMicrophoneStatus(passed ? "pass" : "fail");
    setCurrentStep("speaker");
  };

  const handleSpeakerResult = (passed: boolean) => {
    setSpeakerStatus(passed ? "pass" : "fail");
    setCurrentStep("speed");
  };

  const stepsList = [
    { label: "Overview", active: currentStep === "init" },
    { label: "Camera", active: currentStep === "webcam" },
    { label: "Mic", active: currentStep === "microphone" },
    { label: "Audio", active: currentStep === "speaker" },
    { label: "Speed Test", active: currentStep === "speed" },
  ];

  return (
    <div id="diagnostic-content" className="max-w-3xl mx-auto space-y-12 py-6 select-none">
      <SchemaMarkup
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Sequential Calibration Wizard - CamMicTest.com",
          "description": "Sequential diagnostic check wizard to evaluate browser webcam, mic, speakers, and connection speed.",
        }}
      />

      {/* Pure text Breadcrumbs */}
      <div className="flex items-center justify-between border border-border/80 p-4 rounded font-mono text-[10px] bg-muted/10">
        {stepsList.map((step, idx) => (
          <div key={idx} className="flex items-center gap-1.5 shrink-0">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center border font-semibold ${
              step.active 
                ? "bg-foreground text-background border-foreground" 
                : "border-border text-muted-foreground"
            }`}>
              {idx + 1}
            </span>
            <span className={`tracking-wider uppercase ${step.active ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
              {step.label}
            </span>
            {idx < stepsList.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30" />}
          </div>
        ))}
      </div>

      {/* STEP 1: INITIAL OVERVIEW */}
      {currentStep === "init" && (
        <div className="p-8 border border-border bg-card rounded-xl space-y-8 text-center shadow-sm max-w-xl mx-auto">
          <div className="space-y-3">
            <h2 className="text-2xl font-light tracking-tight text-foreground">Diagnostic Calibration</h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Run a sequential browser test checking camera clarity, input acoustics, channel panning, and internet connection speed.
            </p>
          </div>

          {/* Guidelines */}
          <div className="border border-border p-5 rounded text-left space-y-4 text-xs font-mono max-w-sm mx-auto bg-muted/15">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block">Scan prerequisites</span>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Connect webcam & microphone devices.</li>
              <li>• Close background teleconferencing software.</li>
              <li>• Allow browser hardware permissions on prompt.</li>
            </ul>
          </div>

          <button
            onClick={goToWebcam}
            className="w-full max-w-sm py-3.5 border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground text-[10px] font-medium tracking-wider uppercase rounded transition-colors"
          >
            Initiate Scan
          </button>
        </div>
      )}

      {/* STEP 2: WEBCAM VIEWPORT */}
      {currentStep === "webcam" && (
        <div className="p-8 border border-border bg-card rounded-xl space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Calibration segment 01</span>
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              Camera Input Verification
            </h3>
          </div>

          {/* Viewfinder aspect */}
          <div className="aspect-video w-full max-w-lg mx-auto bg-neutral-950 rounded-lg border border-border overflow-hidden relative">
            {cam.stream ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="crop-marker-tl text-white/50" />
                <div className="crop-marker-tr text-white/50" />
                <div className="crop-marker-bl text-white/50" />
                <div className="crop-marker-br text-white/50" />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center font-mono text-[10px] text-muted-foreground">
                {cam.loading ? "Querying camera sensor..." : "Sensor offline. Re-connect camera."}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto w-full font-mono text-xs">
            <button
              onClick={() => handleWebcamResult(false)}
              className="w-full sm:w-1/2 py-3 border border-destructive text-destructive hover:bg-destructive/5 rounded transition-colors"
            >
              No Stream (Fail)
            </button>
            <button
              onClick={() => handleWebcamResult(true)}
              disabled={!cam.stream}
              className="w-full sm:w-1/2 py-3 border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground rounded transition-colors disabled:opacity-30"
            >
              Stream works (Pass)
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: MICROPHONE CHECK */}
      {currentStep === "microphone" && (
        <div className="p-8 border border-border bg-card rounded-xl space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Calibration segment 02</span>
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              Acoustic Input Verification
            </h3>
          </div>

          <div className="space-y-5 max-w-lg mx-auto">
            <AudioVisualizer analyserRef={mic.analyserRef} type="waveform" isActive={!!mic.stream} />

            <div className="w-full h-1 bg-border rounded-full overflow-hidden">
              <div 
                className="bg-foreground h-full transition-all duration-75"
                style={{ width: `${mic.volume}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto w-full font-mono text-xs">
            <button
              onClick={() => handleMicrophoneResult(false)}
              className="w-full sm:w-1/2 py-3 border border-destructive text-destructive hover:bg-destructive/5 rounded transition-colors"
            >
              Flat Wave (Fail)
            </button>
            <button
              onClick={() => handleMicrophoneResult(true)}
              disabled={!mic.stream}
              className="w-full sm:w-1/2 py-3 border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground rounded transition-colors disabled:opacity-30"
            >
              Signal works (Pass)
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SPEAKER CHECK */}
      {currentStep === "speaker" && (
        <div className="p-8 border border-border bg-card rounded-xl space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Calibration segment 03</span>
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              Speaker Output Verification
            </h3>
          </div>

          <div className="w-full max-w-lg mx-auto py-8 border border-border rounded bg-muted/10 text-center space-y-4">
            <button
              onClick={() => spk.playTone(1000, 0)}
              className={`py-3 px-6 border text-[10px] font-mono uppercase tracking-wider rounded transition-colors inline-flex items-center gap-2 ${
                spk.isPlaying
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-foreground hover:border-foreground"
              }`}
            >
              {spk.isPlaying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
              {spk.isPlaying ? "Playing 1000Hz Tone..." : "Generate Sound Tone"}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto w-full font-mono text-xs">
            <button
              onClick={() => handleSpeakerResult(false)}
              className="w-full sm:w-1/2 py-3 border border-destructive text-destructive hover:bg-destructive/5 rounded transition-colors"
            >
              Muted (Fail)
            </button>
            <button
              onClick={() => handleSpeakerResult(true)}
              className="w-full sm:w-1/2 py-3 border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground rounded transition-colors"
            >
              Audio Heard (Pass)
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SPEED TEST */}
      {currentStep === "speed" && (
        <div className="p-8 border border-border bg-card rounded-xl space-y-6 shadow-sm text-center">
          <div className="text-left space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Calibration segment 04</span>
            <h3 className="text-lg font-medium text-foreground">
              Internet Speed Test
            </h3>
          </div>

          <Speedometer
            speed={net.stage === "download" || net.stage === "upload" ? net.activeSpeed : 0}
            stage={net.stage}
            ping={net.ping}
            jitter={net.jitter}
            downloadSpeed={net.downloadSpeed}
            uploadSpeed={net.uploadSpeed}
            progress={net.progress}
          />

          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-4 animate-pulse">
            {net.stage === "ping" && "Pinging telemetry servers..."}
            {net.stage === "download" && `Downloading test blocks... ${net.progress}%`}
            {net.stage === "upload" && `Uploading payloads... ${net.progress}%`}
            {net.stage === "complete" && "Finalizing results..."}
          </div>
        </div>
      )}

      <AdSlot id="guided-check-editorial-leaderboard" format="horizontal" />
    </div>
  );
}
