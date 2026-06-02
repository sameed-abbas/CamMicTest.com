"use client";

import React, { useEffect, useState, useRef } from "react";
import { useMicrophone } from "@/hooks/useMicrophone";
import AudioVisualizer from "@/components/diagnostics/AudioVisualizer";
import SchemaMarkup, { getFAQSchema } from "@/components/seo/SchemaMarkup";
import AdSlot from "@/components/layout/AdSlot";
import AffiliateRecommendations from "@/components/layout/AffiliateRecommendations";
import { 
  Mic, 
  MicOff, 
  RefreshCw,
  AlertTriangle,
  Volume2,
  Sliders,
  VolumeX,
  ChevronDown,
  HelpCircle
} from "lucide-react";

const MICROPHONE_FAQS = [
  {
    q: "Why is the microphone waveform flat (no sound detected)?",
    a: "This is usually caused by: (1) The microphone is physically muted (check your headset switch or mic volume knob), (2) Browser permission is blocked (click the padlock icon in the URL bar and select 'Allow'), or (3) The wrong microphone is selected in your system settings."
  },
  {
    q: "How can I fix static background buzzing or humming in my microphone?",
    a: "Microphone static or humming is typically caused by electrical interference (e.g. if using a 3.5mm analog jack near power lines), a ground loop, or high system gain. Try: (1) Lowering the microphone input volume/gain in system sound properties to 70-80%, (2) Plugging your mic directly into a USB port on your motherboard rather than an unpowered USB hub, (3) Toggling on 'Noise Suppression' in your settings."
  },
  {
    q: "Can I test Bluetooth, USB, and integrated laptop mics here?",
    a: "Yes. Once you authorize permission, our tool queries all audio input devices recognized by your operating system. You will see a dropdown list containing all USB microphones, Bluetooth headset mics, and built-in microphones, allowing you to select and test each one individually."
  },
  {
    q: "How does the microphone audio recording test work?",
    a: "Our diagnostic page includes a voice recorder check. Click 'Record Voice Check', speak into your microphone, and click 'Stop Recording'. You can immediately play it back. Since the audio is recorded and processed locally in your browser memory (RAM) and never uploaded, this is 100% private."
  },
  {
    q: "Why does my microphone work here but not in Zoom, Teams, or Google Meet?",
    a: "If the mic works here, the hardware is functional. Inside Zoom, Microsoft Teams, or Google Meet, open their specific settings panel (Settings &rarr; Audio) and verify that the exact same microphone device is selected as the active input source. Often these apps default to a virtual or disconnected device."
  }
];

export default function MicrophoneTestPage() {
  const {
    stream,
    activeDevice,
    devices,
    volume,
    isRecording,
    recordingUrl,
    recordingDuration,
    permissionStatus,
    loading,
    start,
    stop,
    analyserRef,
    startRecording,
    stopRecording
  } = useMicrophone();

  const [selectedMicId, setSelectedMicId] = useState("");
  const [visualizerType, setVisualizerType] = useState<"waveform" | "bars">("waveform");
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [activeMicFaq, setActiveMicFaq] = useState<number | null>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  const handleMicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedMicId(id);
    if (stream) {
      start(id);
    }
  };

  const handleStart = () => {
    start(selectedMicId || undefined);
  };

  const handlePlayback = () => {
    if (recordingUrl && audioPlaybackRef.current) {
      if (isPlayingBack) {
        audioPlaybackRef.current.pause();
        setIsPlayingBack(false);
      } else {
        audioPlaybackRef.current.play();
        setIsPlayingBack(true);
      }
    }
  };

  useEffect(() => {
    const audio = audioPlaybackRef.current;
    if (audio) {
      const handleEnded = () => setIsPlayingBack(false);
      audio.addEventListener("ended", handleEnded);
      return () => audio.removeEventListener("ended", handleEnded);
    }
  }, [recordingUrl]);

  useEffect(() => {
    if (recordingUrl) {
      audioPlaybackRef.current = new Audio(recordingUrl);
    }
    return () => {
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.pause();
        audioPlaybackRef.current = null;
      }
    };
  }, [recordingUrl]);

  const micFaqs = [
    {
      q: "How can I test my microphone online?",
      a: "Go to CamMicTest.com, click the Microphone tab, and select 'Test Microphone'. Accept permission to record or check vocal amplitudes."
    },
    {
      q: "What causes a silent microphone or flat waveform?",
      a: "Ensure the microphone is selected in browser preferences, master volume is unmuted, and no background software is locking the audio track."
    }
  ];

  return (
    <div id="diagnostic-content" className="space-y-16 select-none py-6 animate-apple-reveal">
      <SchemaMarkup schema={getFAQSchema(micFaqs)} />

      {/* Editorial Title */}
      <section className="space-y-3 max-w-xl">
        <span className="font-mono text-[10px] uppercase tracking-widest font-semibold text-muted-foreground block">
          Calibration tool
        </span>
        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-foreground">
          Vocal Calibration
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          Monitor acoustic input waves, test recording thresholds, and analyze vocal capture clarity. Processing runs locally.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Visual Box */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 border border-border rounded-xl space-y-8 bg-card shadow-sm transition-apple-spring hover-apple-lift">
            {stream ? (
              <>
                {/* Visualizer canvas */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    <span>Acoustic waveform graph</span>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setVisualizerType("waveform")}
                        className={`transition-colors ${visualizerType === "waveform" ? "text-foreground font-semibold" : "hover:text-foreground"}`}
                      >
                        Waveform
                      </button>
                      <button
                        onClick={() => setVisualizerType("bars")}
                        className={`transition-colors ${visualizerType === "bars" ? "text-foreground font-semibold" : "hover:text-foreground"}`}
                      >
                        Equalizer
                      </button>
                    </div>
                  </div>
                  
                  <AudioVisualizer analyserRef={analyserRef} type={visualizerType} isActive={!!stream} />
                </div>

                {/* Level Meter (Sleek linear design) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    <span>Input amplitude sensitivity</span>
                    <span className="font-semibold text-foreground">{volume}%</span>
                  </div>
                  <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                    <div 
                      className="bg-foreground h-full transition-all duration-75"
                      style={{ width: `${volume}%` }}
                    />
                  </div>
                </div>

                {/* Inputs & Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border/60 pt-6">
                  <div>
                    <label htmlFor="mic-select" className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block mb-2 font-mono">
                      Input Device Source
                    </label>
                    <select
                      id="mic-select"
                      value={selectedMicId}
                      onChange={handleMicChange}
                      className="w-full bg-transparent border border-border text-xs px-3.5 py-2.5 rounded focus:outline-none focus:border-foreground text-foreground"
                    >
                      {devices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone (${device.deviceId.slice(0, 5)})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end gap-2.5">
                    <button
                      onClick={stop}
                      className="flex-1 border border-border text-foreground hover:border-foreground text-[10px] font-medium uppercase tracking-wider py-2.5 rounded transition-apple-spring"
                    >
                      Disable Mic
                    </button>
                    <button
                      onClick={handleStart}
                      className="flex-1 border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground text-[10px] font-medium uppercase tracking-wider py-2.5 rounded transition-apple-spring"
                    >
                      <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Restart
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Offline state */
              <div className="py-12 text-center max-w-xs mx-auto space-y-5">
                {permissionStatus === "denied" ? (
                  <>
                    <AlertTriangle className="w-6 h-6 mx-auto text-destructive animate-pulse" />
                    <h3 className="text-sm font-semibold">Permissions Blocked</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Microphone access has been denied. Grant permissions in your browser URL settings.
                    </p>
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6 mx-auto text-muted-foreground/60" />
                    <h3 className="text-sm font-semibold">Acoustic Feed Offline</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Enable microphone streams to visual decibel meters and verify audio capture logic.
                    </p>
                  </>
                )}

                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="w-full border border-foreground bg-foreground text-background text-[10px] font-medium tracking-wider uppercase py-3 rounded hover:bg-transparent hover:text-foreground transition-apple-spring"
                >
                  {loading ? "Requesting..." : "Test Microphone"}
                </button>
              </div>
            )}
          </div>

          {/* Audio voice recording check */}
          {stream && (
            <div className="p-6 border border-border rounded-xl space-y-4 transition-apple-spring hover-apple-lift">
              <h3 className="font-medium text-sm text-foreground">Loop Feedback Check</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Record a short voice sample and play it back to check for audio distortions, static cracks, or microphone echoes.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {isRecording ? (
                  <button
                    onClick={stopRecording}
                    className="inline-flex items-center justify-center border border-destructive bg-destructive text-white text-[10px] font-medium tracking-wider uppercase px-5 py-2.5 rounded transition-apple-spring animate-pulse"
                  >
                    Stop ({recordingDuration}s)
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    className="inline-flex items-center justify-center border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground text-[10px] font-medium tracking-wider uppercase px-5 py-2.5 rounded transition-apple-spring"
                  >
                    Record sample
                  </button>
                )}

                {recordingUrl && !isRecording && (
                  <button
                    onClick={handlePlayback}
                    className={`inline-flex items-center justify-center text-[10px] font-medium tracking-wider uppercase px-5 py-2.5 rounded border transition-apple-spring ${
                      isPlayingBack
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-foreground hover:border-foreground"
                    }`}
                  >
                    {isPlayingBack ? "Pause playback" : "Playback sample"}
                  </button>
                )}

                {recordingUrl && !isRecording && (
                  <span className="text-[10px] font-mono text-muted-foreground">
                    ✓ Calibration sample captured.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <AdSlot id="mic-minimal-sidebar" format="rectangle" />

          <div className="p-6 border border-border rounded-xl space-y-4 transition-apple-spring hover-apple-lift">
            <h3 className="font-medium text-sm text-foreground">Decibel Sensitivity</h3>
            <div className="space-y-3 font-mono text-[11px] text-muted-foreground">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span>Room noise</span>
                <span className="text-foreground">0 - 20%</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span>Normal speech</span>
                <span className="text-foreground">40 - 65%</span>
              </div>
              <div className="flex justify-between pb-1">
                <span>High input</span>
                <span className="text-foreground">75 - 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: ACOUSTIC SENSOR SPECS */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <span className="font-mono text-[9px] uppercase tracking-widest font-semibold text-muted-foreground block">
            01 / Specifications
          </span>
          <h2 className="text-xl font-light text-foreground">
            Acoustic Specifications
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Understand the digital audio measurements that shape voice capture quality, volume gain, and echo cancellation.
          </p>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 border border-border rounded-xl space-y-3 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground font-mono">
              <Sliders className="w-3.5 h-3.5 text-muted-foreground" />
              <h4 className="font-medium text-xs uppercase tracking-wider">Dynamic Gain & Noise Floor</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Input Gain:</strong> Adjusts microphone sensitivity. Too much gain causes clipping (audio distortion); too little makes your voice faint.<br />
              <strong>Noise Floor:</strong> The level of background static or hiss when silent. Lower noise floors yield clean, crisp speech.
            </p>
          </div>

          <div className="p-6 border border-border rounded-xl space-y-3 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground font-mono">
              <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
              <h4 className="font-medium text-xs uppercase tracking-wider">Digital Sample Rates</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>48 kHz (Studio Quality):</strong> The standard for modern USB microphones, delivering clean audio spectrum capture.<br />
              <strong>44.1 kHz (CD Quality):</strong> Excellent baseline frequency coverage, matching most computer headsets.<br />
              <strong>16 kHz or less (Voice Band):</strong> Restricts high frequencies to save bandwidth, typical for old telephony.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: MICROPHONE TROUBLESHOOTING BLUEPRINT */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <span className="font-mono text-[9px] uppercase tracking-widest font-semibold text-muted-foreground block">
            02 / Diagnostics
          </span>
          <h2 className="text-xl font-light text-foreground">
            Troubleshooting Blueprint
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Steps to fix a quiet microphone, flat waveform, or static audio output.
          </p>
        </div>

        <div className="md:col-span-2 space-y-4 font-mono text-xs">
          <div className="p-5 border border-border rounded-xl space-y-2 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground text-[10px] uppercase font-bold tracking-wider">
              <VolumeX className="w-3.5 h-3.5 text-muted-foreground inline" /> Hardware Mute Buttons
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
              Many USB headsets, external microphones (like Blue Yeti), and keyboard functional rows have dedicated physical mute buttons or inline switches. Verify that the indicator light is solid (not flashing red or muted).
            </p>
          </div>

          <div className="p-5 border border-border rounded-xl space-y-2 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground text-[10px] uppercase font-bold tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground inline" /> Browser Permission Denials
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
              Click the padlock icon on the left edge of your URL bar. Ensure that access to "Microphone" is explicitly toggled to "Allow" and reload the browser page.
            </p>
          </div>

          <div className="p-5 border border-border rounded-xl space-y-2 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground text-[10px] uppercase font-bold tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-muted-foreground inline" /> OS Sound Properties
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
              Navigate to System Settings &rarr; Sound &rarr; Input (macOS) or Settings &rarr; System &rarr; Sound (Windows) to verify that your input volume slider is turned up and that the physical microphone device is set as the default device.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: BROWSER MICROPHONE FAQS */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">Help docs</span>
          <h2 className="text-2xl font-light tracking-tight text-foreground">Microphone Help FAQs</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
            Frequently asked questions about microphone setup, static hums, and device routing.
          </p>
        </div>

        <div className="md:col-span-2 divide-y divide-border/60">
          {MICROPHONE_FAQS.map((faq, idx) => {
            const isOpen = activeMicFaq === idx;
            return (
              <div key={idx} className="py-4 first:pt-0 last:pb-0">
                <button
                  onClick={() => setActiveMicFaq(isOpen ? null : idx)}
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
      <AffiliateRecommendations category="microphone" />
    </div>
  );
}
