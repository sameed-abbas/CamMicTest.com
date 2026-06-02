"use client";

import React, { useEffect, useState, useRef } from "react";
import { useWebcam } from "@/hooks/useWebcam";
import SchemaMarkup, { getFAQSchema } from "@/components/seo/SchemaMarkup";
import AdSlot from "@/components/layout/AdSlot";
import AffiliateRecommendations from "@/components/layout/AffiliateRecommendations";
import { 
  Video, 
  VideoOff, 
  Maximize2, 
  Camera, 
  RefreshCw,
  AlertTriangle,
  Settings,
  HelpCircle,
  ChevronDown
} from "lucide-react";

const WEBCAM_FAQS = [
  {
    q: "Why is my webcam screen showing a black frame?",
    a: "This is typically caused by three common conflicts: (1) Browser permissions are set to block (click the lock icon next to the URL bar to allow), (2) Another software program (like Zoom, OBS Studio, Discord, or Microsoft Teams) is actively using the camera track, or (3) A physical privacy slide covers your lens."
  },
  {
    q: "How can I verify the framerate (FPS) of my camera?",
    a: "Our camera diagnostic tool measures and displays your live framerate (Frames Per Second) directly in the viewport. A standard webcam should output 30 FPS under normal lighting. If it drops to 15 FPS or lower, try increasing the ambient light in your room, as most sensors automatically slow down exposure in dark environments."
  },
  {
    q: "How do I test a second or external USB webcam?",
    a: "Connect the external webcam to your computer. Once you click the start button and authorize camera access, our system will detect all video input devices. A dropdown menu will appear below the camera screen, allowing you to select and switch between your integrated laptop camera and any external USB webcams."
  },
  {
    q: "Why does my camera video look blurry or out of focus?",
    a: "If the video is out of focus: (1) Gently wipe the lens with a microfiber cloth to remove dust or smudges, (2) Ensure you are within the camera's focus range (typically 1.5 to 4 feet away), (3) If your camera supports manual focus, adjust the physical ring around the lens."
  },
  {
    q: "Does this webcam test work on iPhone or Android mobile devices?",
    a: "Yes. CamMicTest.com is fully mobile-compatible. Open our website in iOS Safari or Android Chrome, click the camera check button, and approve the native device access request. You can switch between front (selfie) and rear cameras during the check."
  }
];

export default function WebcamTestPage() {
  const { 
    stream, 
    activeDevice, 
    devices, 
    resolution, 
    liveFps, 
    permissionStatus, 
    loading, 
    start, 
    stop 
  } = useWebcam();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"chrome" | "safari" | "firefox">("chrome");
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [activeWebcamFaq, setActiveWebcamFaq] = useState<number | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedCameraId(id);
    if (stream) {
      start(id);
    }
  };

  const handleStart = () => {
    start(selectedCameraId || undefined);
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  const captureSnapshot = () => {
    const video = videoRef.current;
    if (!video || !stream) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL("image/png");
      setSnapshotUrl(url);
    }
  };

  const webcamFaqs = [
    {
      q: "How can I test my webcam online?",
      a: "Open CamMicTest.com, visit the Camera tab, and select 'Test My Webcam'. Accept the browser permissions prompt to verify your camera feed."
    },
    {
      q: "Why is the camera output showing a black screen?",
      a: "This is usually caused by another application holding a lock on your webcam stream, or privacy permission preferences being toggled off in browser settings."
    }
  ];

  return (
    <div id="diagnostic-content" className="space-y-16 select-none py-6 animate-apple-reveal">
      <SchemaMarkup schema={getFAQSchema(webcamFaqs)} />

      {/* Editorial Title */}
      <section className="space-y-3 max-w-xl">
        <span className="font-mono text-[10px] uppercase tracking-widest font-semibold text-muted-foreground block">
          Calibration tool
        </span>
        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-foreground">
          Camera Validation
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          Verify optical clarity, resolution specifications, and frame synchronization. Execution runs locally on the browser.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Visual Box */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Professional camera viewfinder viewport */}
          <div 
            ref={containerRef}
            className="relative w-full aspect-video rounded-lg border border-border bg-neutral-50 dark:bg-neutral-950 overflow-hidden flex flex-col items-center justify-center group transition-apple-spring hover-apple-lift"
          >
            {stream ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Viewfinder Crop Markers */}
                <div className="crop-marker-tl text-foreground" />
                <div className="crop-marker-tr text-foreground" />
                <div className="crop-marker-bl text-foreground" />
                <div className="crop-marker-br text-foreground" />

                {/* Central hairline crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none select-none opacity-40">
                  <div className="absolute top-1/2 left-0 right-0 h-[0.5px] bg-foreground -translate-y-1/2" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-[0.5px] bg-foreground -translate-x-1/2" />
                </div>

                {/* Subtle visual controls bar (hides/shows on hover) */}
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={captureSnapshot}
                    className="inline-flex items-center gap-1.5 border border-foreground bg-foreground text-background text-[10px] font-medium tracking-wider uppercase px-4 py-2 rounded hover:bg-background hover:text-foreground transition-apple-spring"
                  >
                    <Camera className="w-3.5 h-3.5" /> Snapshot
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 border border-foreground bg-foreground text-background text-[10px] rounded hover:bg-background hover:text-foreground transition-apple-spring"
                    aria-label="Fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              /* Offline state */
              <div className="p-8 text-center max-w-xs space-y-5">
                <div className="crop-marker-tl text-border" />
                <div className="crop-marker-tr text-border" />
                <div className="crop-marker-bl text-border" />
                <div className="crop-marker-br text-border" />

                {permissionStatus === "denied" ? (
                  <>
                    <AlertTriangle className="w-6 h-6 mx-auto text-destructive animate-pulse" />
                    <h3 className="text-sm font-semibold">Permissions Blocked</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Camera feed has been blocked. Review the configuration checklist below.
                    </p>
                  </>
                ) : (
                  <>
                    <Video className="w-6 h-6 mx-auto text-muted-foreground/60" />
                    <h3 className="text-sm font-semibold">Feed Offline</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Initiate the calibration engine to check video feed status.
                    </p>
                  </>
                )}

                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="w-full border border-foreground bg-foreground text-background text-[10px] font-medium tracking-wider uppercase py-3 rounded hover:bg-transparent hover:text-foreground transition-apple-spring"
                >
                  {loading ? "Initializing..." : "Test Webcam"}
                </button>
              </div>
            )}
          </div>

          {/* Controller options */}
          {stream && (
            <div className="p-6 border border-border rounded-xl space-y-6 transition-apple-spring hover-apple-lift">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <label htmlFor="camera-select" className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block mb-2 font-mono">
                      Input Device Source
                    </label>
                    <select
                      id="camera-select"
                      value={selectedCameraId}
                      onChange={handleCameraChange}
                      className="w-full bg-transparent border border-border text-xs px-3.5 py-2.5 rounded focus:outline-none focus:border-foreground text-foreground"
                    >
                      {devices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera (${device.deviceId.slice(0, 5)})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-2.5 pt-4 md:pt-0">
                    <button
                      onClick={stop}
                      className="border border-border text-foreground hover:border-foreground text-[10px] font-medium uppercase tracking-wider px-5 py-2.5 rounded transition-apple-spring"
                    >
                      <VideoOff className="w-3.5 h-3.5 inline mr-1" /> Terminate Stream
                    </button>
                    <button
                      onClick={handleStart}
                      className="border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground text-[10px] font-medium uppercase tracking-wider px-5 py-2.5 rounded transition-apple-spring"
                    >
                      <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Restart
                    </button>
                  </div>
                </div>
              </div>

              {/* Monospace Specs Grid */}
              <div className="grid grid-cols-3 gap-0 border border-border/80 divide-x divide-border/80 rounded overflow-hidden text-center font-mono text-[11px] py-2 bg-muted/10">
                <div className="py-2.5 space-y-1">
                  <span className="text-[8px] uppercase tracking-wider text-muted-foreground block">Resolutions</span>
                  <span className="font-semibold text-foreground">
                    {resolution ? `${resolution.width} x ${resolution.height}` : "---"}
                  </span>
                </div>
                <div className="py-2.5 space-y-1">
                  <span className="text-[8px] uppercase tracking-wider text-muted-foreground block">Frame Rate</span>
                  <span className="font-semibold text-foreground">
                    {liveFps > 0 ? `${liveFps} FPS` : "---"}
                  </span>
                </div>
                <div className="py-2.5 space-y-1">
                  <span className="text-[8px] uppercase tracking-wider text-muted-foreground block">Device State</span>
                  <span className="font-semibold text-success uppercase">Active</span>
                </div>
              </div>
            </div>
          )}

          {/* Photo snapshot preview dialog */}
          {snapshotUrl && (
            <div className="p-6 border border-foreground/30 rounded-xl space-y-4 animate-in fade-in zoom-in-95 duration-250">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Snapshot verification</span>
                <button onClick={() => setSnapshotUrl(null)} className="text-[10px] text-muted-foreground hover:text-foreground hover:underline">
                  Dismiss
                </button>
              </div>
              <div className="relative border border-border rounded aspect-video overflow-hidden max-w-md mx-auto bg-black">
                <img src={snapshotUrl} alt="Webcam Photo Test" className="w-full h-full object-cover" />
              </div>
              <div className="flex justify-end pt-2">
                <a
                  href={snapshotUrl}
                  download="camera-diagnostic-snapshot.png"
                  className="border border-foreground bg-foreground text-background text-[10px] font-medium tracking-wider uppercase px-4 py-2.5 rounded hover:bg-transparent hover:text-foreground transition-apple-spring"
                >
                  Download Frame
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <AdSlot id="webcam-minimal-sidebar" format="rectangle" />
          
          <div className="p-6 border border-border rounded-xl space-y-4 transition-apple-spring hover-apple-lift">
            <h3 className="font-medium text-sm text-foreground">Optics Checklist</h3>
            <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong>Refresh target:</strong> Online video feeds are optimal at 30 FPS. Low FPS indicates host computer background process overload.
              </p>
              <p>
                <strong>Focus check:</strong> Clear, readable text is a simple test of your webcam sensor's local autofocus response.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: TECHNICAL SPECIFICATIONS REFERENCE */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <span className="font-mono text-[9px] uppercase tracking-widest font-semibold text-muted-foreground block">
            01 / Specifications
          </span>
          <h2 className="text-xl font-light text-foreground">
            Webcam Technical Specs
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Understand the core metrics that define image clarity, smoothness, and performance during video teleconferencing.
          </p>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 border border-border rounded-xl space-y-3 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground font-mono">
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
              <h4 className="font-medium text-xs uppercase tracking-wider">Resolution Scaling</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>1080p (FHD):</strong> The current corporate standard for video calls. Delivers high optical details.<br />
              <strong>720p (HD):</strong> Standard resolution for typical web cameras. Light on data load while keeping readable outlines.<br />
              <strong>4K (UHD):</strong> Professional creators standard. Requires high light capture and extreme bandwidth.
            </p>
          </div>

          <div className="p-6 border border-border rounded-xl space-y-3 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground font-mono">
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
              <h4 className="font-medium text-xs uppercase tracking-wider">Frame Rate Metrics</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>60 FPS:</strong> Silky smooth rendering, optimal for active presenters or hardware showing dynamic motion.<br />
              <strong>30 FPS:</strong> Standard cinematic baseline. Natural to human eyes, reducing background system resource draw.<br />
              <strong>15 FPS:</strong> Flickery or choppy motion. Usually points to weak ambient light or overloaded background CPUs.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: WEBCAM TROUBLESHOOTING BLUEPRINT */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <span className="font-mono text-[9px] uppercase tracking-widest font-semibold text-muted-foreground block">
            02 / Diagnostics
          </span>
          <h2 className="text-xl font-light text-foreground">
            Troubleshooting Blueprint
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Quick diagnostics if your camera indicator fails to activate, shows a black screen, or lags.
          </p>
        </div>

        <div className="md:col-span-2 space-y-4 font-mono text-xs">
          <div className="p-5 border border-border rounded-xl space-y-2 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground text-[10px] uppercase font-bold tracking-wider">
              <span className="text-muted-foreground">01.</span> Physical Kill Switches
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
              Many modern laptops (such as Lenovo ThinkPads, HP EliteBooks, and Asus models) include physical slider switches on the top frame or function hotkeys (F10/F14) that disable the sensor hardware directly. Make sure the lens slider is set to open.
            </p>
          </div>

          <div className="p-5 border border-border rounded-xl space-y-2 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground text-[10px] uppercase font-bold tracking-wider">
              <span className="text-muted-foreground">02.</span> App Resource Lockouts
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
              Webcams can only stream to one active application at a time. If Zoom, OBS Studio, Discord, Teams, or another browser tab is open in the background, it may lock the device feed. Close conflicting apps and refresh this page.
            </p>
          </div>

          <div className="p-5 border border-border rounded-xl space-y-2 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground text-[10px] uppercase font-bold tracking-wider">
              <span className="text-muted-foreground">03.</span> OS Hardware Authorizations
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
              Navigate to System Settings &rarr; Privacy & Security &rarr; Camera (macOS) or Settings &rarr; Privacy &rarr; Camera (Windows) and confirm that your browser application is authorized to access the camera hardware.
            </p>
          </div>
        </div>
      </section>

      {/* Permissions instructions */}
      <section className="scroll-reveal border-t border-border/80 pt-12 space-y-6">
        <div className="space-y-1">
          <span className="font-mono text-[9px] uppercase tracking-widest font-semibold text-muted-foreground block">
            03 / Permissions
          </span>
          <h2 className="text-xl font-light text-foreground">Browser Permission Guides</h2>
        </div>
        
        <div className="flex gap-4 border-b border-border/60 pb-0">
          {(["chrome", "safari", "firefox"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 text-xs font-bold capitalize transition-all border-b-2 -mb-[2px] ${
                activeTab === tab
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "chrome" ? "Chrome" : tab === "safari" ? "Safari" : "Firefox"}
            </button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground leading-relaxed max-w-2xl space-y-2">
          {activeTab === "chrome" && (
            <ol className="list-decimal list-inside space-y-2">
              <li>Click the <strong>padlock symbol 🔒</strong> left of the URL.</li>
              <li>Toggle <strong>Camera</strong> access to <strong>Allow</strong>.</li>
              <li>Reload the browser window to calibrate.</li>
            </ol>
          )}

          {activeTab === "safari" && (
            <ol className="list-decimal list-inside space-y-2">
              <li>Click <strong>Safari</strong> in the menu &rarr; <strong>Settings for This Website...</strong></li>
              <li>Locate <strong>Camera</strong> permissions and set to <strong>Allow</strong>.</li>
              <li>Refresh to establish media stream connection.</li>
            </ol>
          )}

          {activeTab === "firefox" && (
            <ol className="list-decimal list-inside space-y-2">
              <li>Click the <strong>permission block symbol</strong> in the URL input bar.</li>
              <li>Clear the <strong>Blocked Temporarily</strong> configuration setting.</li>
              <li>Reload and choose 'Remember this decision' during prompt.</li>
            </ol>
          )}
        </div>
      </section>

      {/* SECTION 4: BROWSER WEBCAM FAQS */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">Help docs</span>
          <h2 className="text-2xl font-light tracking-tight text-foreground">Webcam Help FAQs</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
            Frequently asked questions about webcam setup and troubleshooting.
          </p>
        </div>

        <div className="md:col-span-2 divide-y divide-border/60">
          {WEBCAM_FAQS.map((faq, idx) => {
            const isOpen = activeWebcamFaq === idx;
            return (
              <div key={idx} className="py-4 first:pt-0 last:pb-0">
                <button
                  onClick={() => setActiveWebcamFaq(isOpen ? null : idx)}
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

      {/* Gear Recommendations */}
      <AffiliateRecommendations category="webcam" />
    </div>
  );
}
