"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSystemDiagnostics } from "@/hooks/useSystemDiagnostics";
import { useMicrophone } from "@/hooks/useMicrophone";
import AudioVisualizer from "@/components/diagnostics/AudioVisualizer";
import SchemaMarkup, { getDiagnosticsSchema } from "@/components/seo/SchemaMarkup";
import AdSlot from "@/components/layout/AdSlot";
import AffiliateRecommendations from "@/components/layout/AffiliateRecommendations";
import { 
  Video, 
  Mic, 
  Headphones, 
  Wifi, 
  ArrowRight,
  Monitor,
  Globe,
  Terminal,
  ChevronDown,
  Volume2,
  RefreshCw,
  MicOff,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Cpu
} from "lucide-react";

export default function HomePage() {
  const { system, loading: sysLoading } = useSystemDiagnostics();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Live microphone hook for the hero widget
  const mic = useMicrophone();
  const [selectedMicId, setSelectedMicId] = useState("");
  const [articles, setArticles] = useState<any[]>([
    {
      slug: "why-is-my-webcam-black",
      title: "Why is My Webcam Black? How to Fix Camera Black Screen Issues",
      excerpt: "Learn the common reasons why webcams show a black screen and get step-by-step diagnostic guides.",
      category: "Webcam Help",
      color: "bg-indigo-500/10 text-indigo-500",
      imageUrl: "/blog-webcam-black.png"
    },
    {
      slug: "how-to-enable-camera-mic",
      title: "How to Enable Camera & Microphone Permissions in Major Browsers",
      excerpt: "A step-by-step guide to unblocking and enabling camera and microphone permission prompts.",
      category: "Browser Settings",
      color: "bg-emerald-500/10 text-emerald-500",
      imageUrl: "/blog-enable-permissions.png"
    }
  ]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/blog");
        if (res.ok) {
          const dbBlogs = await res.json();
          const staticArticles = [
            {
              slug: "why-is-my-webcam-black",
              title: "Why is My Webcam Black? How to Fix Camera Black Screen Issues",
              excerpt: "Learn the common reasons why webcams show a black screen and get step-by-step diagnostic guides.",
              date: "June 02, 2026",
              category: "Webcam Help",
              color: "bg-indigo-500/10 text-indigo-500",
              imageUrl: "/blog-webcam-black.png"
            },
            {
              slug: "how-to-enable-camera-mic",
              title: "How to Enable Camera & Microphone Permissions in Major Browsers",
              excerpt: "A step-by-step guide to unblocking and enabling camera and microphone permission prompts.",
              date: "May 25, 2026",
              category: "Browser Settings",
              color: "bg-emerald-500/10 text-emerald-500",
              imageUrl: "/blog-enable-permissions.png"
            }
          ];

          const formattedDb = dbBlogs.map((b: any) => ({
            slug: b.slug,
            title: b.title,
            excerpt: b.excerpt,
            category: b.category,
            color: b.color,
            imageUrl: b.imageUrl,
            createdAt: b.publishedAt
          }));

          const uniqueStatic = staticArticles.filter(
            (s) => !dbBlogs.some((b: any) => b.slug === s.slug)
          );

          const formattedStatic = uniqueStatic.map((s) => ({
            ...s,
            createdAt: new Date(s.date).toISOString()
          }));

          const merged = [...formattedDb, ...formattedStatic].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setArticles(merged.slice(0, 2));
        }
      } catch (e) {
        // ignore
      }
    };
    fetchBlogs();
  }, []);


  const handleMicStart = () => {
    mic.start(selectedMicId || undefined);
  };

  const testSections = [
    {
      href: "/webcam-test",
      index: "01",
      title: "Webcam Camera Test",
      subtitle: "Test if your camera is working",
      description: "Open your camera feed, verify image clarity, check resolution measurements, and count screen frames per second (FPS).",
      linkText: "Test camera",
    },
    {
      href: "/microphone-test",
      index: "02",
      title: "Microphone Voice Test",
      subtitle: "Check if people can hear you",
      description: "Test your voice volumes, view real-time sound waveforms, and record a 5-second sample to listen to your mic quality.",
      linkText: "Test microphone",
    },
    {
      href: "/speaker-test",
      index: "03",
      title: "Sound Speaker Test",
      subtitle: "Hear sound from left & right channels",
      description: "Verify your audio output. Play stereo sound balances, check left and right channel speakers, and adjust tone pitches.",
      linkText: "Test speakers",
    },
    {
      href: "/speed-test",
      index: "04",
      title: "Internet Speed Test",
      subtitle: "Check how fast your internet is",
      description: "Measure your internet connection. Check download speeds, upload speeds, response latency (ping), and network stability (jitter).",
      linkText: "Test speed",
    }
  ];

  const faqs = [
    {
      q: "Does this website record my video camera or voice?",
      a: "No. All diagnostic checks are executed locally inside your web browser. We do not record, save, or upload any video or audio data to our servers. Your privacy is 100% secure."
    },
    {
      q: "How do I unblock camera or microphone permissions?",
      a: "Click the lock symbol (🔒) on the left side of your browser's address URL bar. Change the dropdown menu next to 'Camera' or 'Microphone' to 'Allow', then refresh the page."
    },
    {
      q: "Why is my webcam screen showing black?",
      a: "This is usually caused by: (1) Camera permissions blocked in browser settings, (2) Another software program (like Zoom, Teams, or OBS) using your camera in the background, or (3) A physical privacy slider closed on your lens."
    },
    {
      q: "Why does my internet speed test show different results than other sites?",
      a: "Our speed test engine utilizes multi-threaded parallel downloads and uploads directly to Cloudflare CDN edge nodes. By excluding handshake latency and TCP slow-start phases, it isolates your raw bandwidth capacity with Fast.com-level precision. Other tests might include slow routing server delays, reporting artificially low throughput."
    },
    {
      q: "Can I test my devices on mobile browsers like iOS Safari or Android Chrome?",
      a: "Yes, CamMicTest.com is mobile-responsive. Simply load our site on Apple Safari (iOS) or Google Chrome (Android). The mobile browser will launch native system prompts allowing you to test the front/rear cameras, microphone arrays, and speaker panning."
    },
    {
      q: "How do I troubleshoot microphone background humming or static noise?",
      a: "Microphone hum is often due to high audio gain (above 80%), cheap electrical shielding on USB/3.5mm connectors, or generic background noise. Try lowering your microphone input volume in your system settings to 75% and plug the mic directly into your PC instead of a USB hub."
    },
    {
      q: "Why do I hear sound in both ears during the single speaker channel test?",
      a: "If left-channel or right-channel testing plays in both ears, check if 'Mono Audio' is active under Accessibility settings in macOS, Windows, iOS, or Android. Mono Audio forces the system to combine stereo channels, removing spatial panning separation."
    },
    {
      q: "How do I unblock browser hardware permissions on macOS System Settings?",
      a: "Open System Settings &rarr; Privacy & Security &rarr; Camera (or Microphone). Ensure your browser (Safari, Chrome, Edge, or Firefox) is toggled to ON. Then restart your browser and re-run the diagnostic tests."
    }
  ];

  return (
    <div id="diagnostic-content" className="space-y-24 py-10 select-none animate-apple-reveal">
      <SchemaMarkup schema={getDiagnosticsSchema()} />

      {/* Hero Section (Asymmetrical 2-Column: Copy vs Interactive Widget) */}
      <section className="hero-container grid grid-cols-1 lg:grid-cols-12 gap-12 p-8 md:p-12 rounded-2xl items-center">
        
        {/* Left Column: Direct obvious copy */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-widest font-semibold text-muted-foreground block">
              Free browser diagnostics
            </span>
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-foreground leading-[1.05] max-w-xl">
              Test your camera <br />
              and microphone. <span className="font-normal text-muted-foreground">Instantly.</span>
            </h1>
          </div>
          
          <p className="text-xs md:text-sm text-muted-foreground max-w-lg leading-relaxed">
            Click Allow to check if your webcam, microphone, speakers, and internet speed are working properly. All diagnostics run locally in your browser. 100% free and private.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 font-mono text-[10px]">
            <Link
              href="/device-check"
              className="inline-flex items-center justify-center border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground font-semibold tracking-wider uppercase px-6 py-3.5 rounded transition-apple-spring"
            >
              Start Complete Test
            </Link>
          </div>
        </div>

        {/* Right Column: Interactive Mic Test Widget */}
        <div className="lg:col-span-5 w-full">
          <div className="border border-border p-6 rounded-xl bg-card space-y-5 transition-apple-spring hover-apple-lift">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-mono text-[9px] uppercase tracking-widest font-semibold text-muted-foreground block">
                Instant Mic Check
              </span>
              {mic.stream && (
                <span className="text-[9px] font-mono uppercase bg-success/15 text-success border border-success/15 px-2 py-0.5 rounded">
                  Connected
                </span>
              )}
            </div>

            {mic.stream ? (
              <div className="space-y-4">
                <AudioVisualizer analyserRef={mic.analyserRef} type="waveform" isActive={!!mic.stream} />
                
                {/* Simple Linear Level bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[8px] text-muted-foreground uppercase">
                    <span>Input Volume</span>
                    <span>{mic.volume}%</span>
                  </div>
                  <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                    <div 
                      className="bg-foreground h-full transition-all duration-75"
                      style={{ width: `${mic.volume}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={mic.stop}
                    className="w-full border border-border text-foreground hover:border-foreground font-mono text-[10px] uppercase tracking-wider py-2.5 rounded transition-apple-spring"
                  >
                    Mute Mic
                  </button>
                  <button
                    onClick={handleMicStart}
                    className="w-full border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground font-mono text-[10px] uppercase tracking-wider py-2.5 rounded transition-apple-spring"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <Mic className="w-6 h-6 mx-auto text-muted-foreground/60" />
                <div className="space-y-1 text-center">
                  <h3 className="text-xs font-semibold text-foreground">Is your microphone working?</h3>
                  <p className="text-[10px] text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                    Test your audio input response instantly by granting temporary browser access.
                  </p>
                </div>
                
                <button
                  onClick={handleMicStart}
                  disabled={mic.loading}
                  className="w-full py-2.5 border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground font-mono text-[10px] uppercase tracking-wider rounded transition-apple-spring"
                >
                  {mic.loading ? "Checking..." : "Verify Microphone"}
                </button>
              </div>
            )}
          </div>
        </div>

      </section>

      {/* Specs Environment Summary Grid */}
      <section className="border-y border-border/60 py-8">
        {sysLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-muted/65 rounded" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">OS Environment</span>
              <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-foreground/75" />
                {system?.os || "Unknown"}
              </span>
            </div>
            <div className="space-y-1 border-l border-border/40 pl-4">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">Browser</span>
              <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-foreground/75" />
                {system?.browser || "Unknown"}
              </span>
            </div>
            <div className="space-y-1 border-l border-border/40 pl-4">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">Viewport Size</span>
              <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-foreground/75" />
                {system?.viewportSize || "Unknown"}
              </span>
            </div>
            <div className="space-y-1 border-l border-border/40 pl-4">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">Network Profile</span>
              <span className="text-xs font-medium text-foreground">
                {system?.networkType || "Unknown"}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Grid of Standalone Tests (Obvious labels & plain explanations) */}
      <section className="scroll-reveal space-y-12">
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">Choose a specific test</span>
          <h2 className="text-2xl font-light tracking-tight text-foreground">Hardware Standalone Tests</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {testSections.map((sect) => (
            <div
              key={sect.href}
              className="flex flex-col justify-between space-y-4 border-t border-border/60 pt-6 transition-apple-spring hover:border-foreground"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                  <span>{sect.index} / {sect.title}</span>
                </div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground mt-2">{sect.subtitle}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                  {sect.description}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href={sect.href}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:underline group"
                >
                  {sect.linkText}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: COMPARATIVE GUIDE (Browser vs Desktop App Diagnostics) */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <span className="font-mono text-[9px] uppercase tracking-widest font-semibold text-muted-foreground block">
            01 / Comparison
          </span>
          <h2 className="text-xl font-light text-foreground">
            Browser vs App Diagnostics
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Why sandboxed browser diagnostics provide a faster, safer, and cleaner route to checking your devices compared to native software applications.
          </p>
        </div>

        <div className="md:col-span-2 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-border/60 text-[9px] uppercase tracking-widest text-muted-foreground">
                <th className="pb-3 pr-4">Metrics Checked</th>
                <th className="pb-3 pr-4">CamMicTest.com</th>
                <th className="pb-3">Native Apps (Zoom/Teams)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-muted-foreground">
              <tr>
                <td className="py-3.5 font-semibold text-foreground pr-4">Installation Requirement</td>
                <td className="py-3.5 text-success pr-4">None (Zero Downloads)</td>
                <td className="py-3.5">Heavy Desktop Client Required</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold text-foreground pr-4">Privacy Boundary</td>
                <td className="py-3.5 text-success pr-4">100% Sandboxed (No data uploads)</td>
                <td className="py-3.5">Telemetry & Account required</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold text-foreground pr-4">System Latency</td>
                <td className="py-3.5 text-success pr-4">Instantaneous (Starts in 0.5s)</td>
                <td className="py-3.5">Slow (Requires client boot)</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold text-foreground pr-4">Dual Panning Stereo Check</td>
                <td className="py-3.5 text-success pr-4">Supported</td>
                <td className="py-3.5">Usually Mono only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 5: PRIVACY & SECURITY BLUEPRINT */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <span className="font-mono text-[9px] uppercase tracking-widest font-semibold text-muted-foreground block">
            02 / Security
          </span>
          <h2 className="text-xl font-light text-foreground">
            Zero-Trust Privacy Blueprint
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All webcam, audio, and network diagnostic tests execute 100% client-side. We strictly enforce sandboxed boundaries.
          </p>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono text-xs">
          <div className="p-6 border border-border rounded-xl space-y-3 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span className="font-bold uppercase tracking-wider text-[10px]">HTML5 Sandboxing</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
              All microphone and webcam inputs utilize the standard HTML5 MediaDevices API. This guarantees that stream data is rendered inside the browser's sandbox and cannot write to your physical hard drive or access external registries.
            </p>
          </div>

          <div className="p-6 border border-border rounded-xl space-y-3 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground">
              <Cpu className="w-4 h-4 text-success" />
              <span className="font-bold uppercase tracking-wider text-[10px]">Zero-Telemetry Cookies</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
              We do not transmit your voice tracks or camera footage back to any central servers. Latency measurements are calculated using secure dummy files from CDN edge nodes, protecting your physical IP location and digital footprint.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: BROWSER CAPABILITY MATRIX */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <span className="font-mono text-[9px] uppercase tracking-widest font-semibold text-muted-foreground block">
            03 / Compatibility
          </span>
          <h2 className="text-xl font-light text-foreground">
            Browser Capability Matrix
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A comprehensive matrix showing hardware diagnostics compatibility across modern client operating systems and browser engines.
          </p>
        </div>

        <div className="md:col-span-2 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-border/60 text-[9px] uppercase tracking-widest text-muted-foreground">
                <th className="pb-3 pr-4">Browser Engine</th>
                <th className="pb-3 pr-4">Webcam Test</th>
                <th className="pb-3 pr-4">Mic Test</th>
                <th className="pb-3 pr-4">Speaker Test</th>
                <th className="pb-3">Speed Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-muted-foreground text-[11px]">
              <tr>
                <td className="py-3 font-semibold text-foreground pr-4">Google Chrome</td>
                <td className="py-3 text-success pr-4">✓ 100% Compatible</td>
                <td className="py-3 text-success pr-4">✓ 100% Compatible</td>
                <td className="py-3 text-success pr-4">✓ 100% Compatible</td>
                <td className="py-3 text-success">✓ 100% Compatible</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-foreground pr-4">Apple Safari</td>
                <td className="py-3 text-success pr-4">✓ 100% Compatible</td>
                <td className="py-3 text-success pr-4">✓ 100% Compatible</td>
                <td className="py-3 text-success pr-4">✓ 100% Compatible</td>
                <td className="py-3 text-success">✓ 100% Compatible</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-foreground pr-4">Mozilla Firefox</td>
                <td className="py-3 text-success pr-4">✓ 100% Compatible</td>
                <td className="py-3 text-success pr-4">✓ 100% Compatible</td>
                <td className="py-3 text-muted-foreground pr-4">Limited (Stereo Panning)</td>
                <td className="py-3 text-success">✓ 100% Compatible</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-foreground pr-4">Microsoft Edge</td>
                <td className="py-3 text-success pr-4">✓ 100% Compatible</td>
                <td className="py-3 text-success pr-4">✓ 100% Compatible</td>
                <td className="py-3 text-success pr-4">✓ 100% Compatible</td>
                <td className="py-3 text-success">✓ 100% Compatible</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 7: COMMON BROWSER DEVICE ERRORS & TROUBLESHOOTING */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <span className="font-mono text-[9px] uppercase tracking-widest font-semibold text-muted-foreground block">
            04 / Troubleshooting
          </span>
          <h2 className="text-xl font-light text-foreground">
            WebRTC Hardware Error Codes
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            If your camera or microphone fails to load, the browser will throw a standard WebRTC error. Use this reference table to diagnose the underlying hardware conflict.
          </p>
        </div>

        <div className="md:col-span-2 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-border/60 text-[9px] uppercase tracking-widest text-muted-foreground">
                <th className="pb-3 pr-4">Error Name</th>
                <th className="pb-3 pr-4">Root Cause</th>
                <th className="pb-3">Resolution Steps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-muted-foreground text-[11px]">
              <tr>
                <td className="py-3.5 font-semibold text-destructive pr-4">NotAllowedError</td>
                <td className="py-3.5 pr-4 text-foreground">Permissions Denied</td>
                <td className="py-3.5 font-sans">Click the lock/padlock icon next to the URL, change Camera & Microphone permissions to "Allow", and refresh the page.</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold text-destructive pr-4">NotFoundError / DevicesNotFoundError</td>
                <td className="py-3.5 pr-4 text-foreground">No Hardware Detected</td>
                <td className="py-3.5 font-sans">Check if the cable is fully plugged in. Try a different USB port or inspect your physical cable connections.</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold text-destructive pr-4">NotReadableError / TrackStartError</td>
                <td className="py-3.5 pr-4 text-foreground">Device Locked by Another App</td>
                <td className="py-3.5 font-sans">Close background software using your camera or mic (e.g. Zoom, MS Teams, Skype, Google Meet, Discord, or OBS Studio).</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold text-destructive pr-4">OverconstrainedError</td>
                <td className="py-3.5 pr-4 text-foreground">Resolution/FPS Not Supported</td>
                <td className="py-3.5 font-sans">The camera lens cannot support the requested settings. Let the site select a default resolution.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Ad slot */}
      <AdSlot id="home-editorial-leaderboard" format="horizontal" />

      {/* SECTION 8: LATEST BLOG GUIDES */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <span className="font-mono text-[9px] uppercase tracking-widest font-semibold text-muted-foreground block">
            05 / Insights & Help
          </span>
          <h2 className="text-xl font-light text-foreground">
            Troubleshooting Blog
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
            Read expert diagnostics guides from our hardware engineering team to fix camera stutters, permissions locks, and stream latency.
          </p>
          <div className="pt-2">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0071E3] hover:underline font-mono uppercase tracking-wider text-[9px]"
            >
              View all articles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {articles.map((article) => (
            <div 
              key={article.slug}
              className="border border-border rounded-xl bg-card overflow-hidden hover-apple-lift transition-apple-spring flex flex-col"
            >
              <div className="w-full aspect-video bg-neutral-900 overflow-hidden border-b border-border/20">
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105" 
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className={`inline-flex text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${article.color || "bg-indigo-500/10 text-indigo-500"}`}>
                    {article.category}
                  </span>
                  <h3 className="text-xs font-bold text-foreground hover:text-[#0071E3] transition-colors line-clamp-2">
                    <Link href={`/blog/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
                <Link 
                  href={`/blog/${article.slug}`} 
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0071E3] hover:underline mt-2 self-start"
                >
                  Read Guide <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">Help docs</span>
          <h2 className="text-2xl font-light tracking-tight text-foreground">Support FAQs</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
            Frequently asked questions about media queries and permissions.
          </p>
        </div>

        <div className="md:col-span-2 divide-y divide-border/60">
          {faqs.map((faq, idx) => {
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

      {/* Equipment Suggestions */}
      <AffiliateRecommendations category="all" />
    </div>
  );
}
