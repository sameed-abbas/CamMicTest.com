"use client";

import React, { useState } from "react";
import { useSpeaker } from "@/hooks/useSpeaker";
import SchemaMarkup, { getFAQSchema } from "@/components/seo/SchemaMarkup";
import AdSlot from "@/components/layout/AdSlot";
import AffiliateRecommendations from "@/components/layout/AffiliateRecommendations";
import { 
  Sliders, 
  Volume2, 
  VolumeX, 
  Play, 
  Square,
  Radio,
  Music,
  HelpCircle,
  AlertTriangle,
  ChevronDown
} from "lucide-react";

const SPEAKER_FAQS = [
  {
    q: "Why is there no sound playing during the speaker test?",
    a: "This is usually caused by browser autoplay restrictions, system-level muting, or incorrect device routing. Ensure you have clicked one of the test buttons (e.g. 'Test Left Channel') which initializes the browser's Web Audio context. Also, open your OS audio settings and verify that the output volume is raised and set to the correct headphones or speakers."
  },
  {
    q: "Why does the left channel sound play through both ears in my headphones?",
    a: "If stereo panned audio plays in both ears, 'Mono Audio' is likely enabled in your operating system's Accessibility settings. Toggling Mono Audio combines the distinct left and right tracks into a single stream. Disable Mono Audio in macOS (System Settings &rarr; Accessibility &rarr; Audio) or Windows (Settings &rarr; Accessibility &rarr; Audio) to restore stereo separation."
  },
  {
    q: "What is white noise and what is it used for in speaker tests?",
    a: "White noise contains all audible sound frequencies (20 Hz to 20,000 Hz) played at equal volume levels. It is used to test the full frequency response range of your speakers or headphones, helping to detect speaker rattles, static crackling, or gaps in frequency coverage."
  },
  {
    q: "What is a frequency sweep and why does the tone change pitch?",
    a: "A frequency sweep dynamically moves the pitch of a synthetic sine wave from a very deep bass (100 Hz) to a high treble (10,000 Hz). This allows you to verify how well your speakers or headphones reproduce low-frequency sub-bass tones and high-frequency pitches."
  },
  {
    q: "Does this speaker test work on mobile devices?",
    a: "Yes. CamMicTest.com is mobile-responsive and supports stereo separation checks on iOS (Safari) and Android (Chrome) devices. Connect your headphones or turn on your built-in speakers and click the test buttons to verify routing."
  }
];

export default function SpeakerTestPage() {
  const {
    isPlaying,
    isPlayingLeft,
    isPlayingRight,
    isPlayingNoise,
    frequency,
    volume,
    devices,
    activeDeviceId,
    error,
    playTone,
    playLeftChannel,
    playRightChannel,
    playNoise,
    stop,
    setVolume,
    setFrequency,
    selectDevice
  } = useSpeaker();

  const [localFreq, setLocalFreq] = useState(1000);
  const [localVol, setLocalVol] = useState(50);
  const [activeSpeakerFaq, setActiveSpeakerFaq] = useState<number | null>(null);

  const handleFreqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setLocalFreq(val);
    setFrequency(val);
  };

  const handleVolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setLocalVol(val);
    setVolume(val);
  };

  const handlePlayStandard = () => {
    if (isPlaying) {
      stop();
    } else {
      playTone(localFreq, 0);
    }
  };

  const isAudioActive = isPlaying || isPlayingLeft || isPlayingRight || isPlayingNoise;

  const speakerFaqs = [
    {
      q: "How do I run a speaker channel test?",
      a: "Navigate to the Audio page on CamMicTest.com, set your volume, and click 'Left Channel' or 'Right Channel' to verify stereo panning balance."
    },
    {
      q: "Why can I not hear any sound?",
      a: "Verify that your computer sound is unmuted, speakers are turned on, and the correct sound output routing is active in settings."
    }
  ];

  return (
    <div id="diagnostic-content" className="space-y-16 select-none py-6 animate-apple-reveal">
      <SchemaMarkup schema={getFAQSchema(speakerFaqs)} />

      {/* Editorial Title */}
      <section className="space-y-3 max-w-xl">
        <span className="font-mono text-[10px] uppercase tracking-widest font-semibold text-muted-foreground block">
          Calibration tool
        </span>
        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-foreground">
          Acoustic Validation
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          Verify spatial channels, adjust wave frequency pitches, and check stereo panner separation. Processing runs locally.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Main diagnostic board */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 border border-border bg-card rounded-xl space-y-8 shadow-sm transition-apple-spring hover-apple-lift">
            
            {/* Minimalist Stereo Balance Panel */}
            <div className="w-full py-8 border border-border rounded-lg flex items-center justify-around text-center relative overflow-hidden bg-muted/10">
              <div className="space-y-1 z-10">
                <div className={`text-3xl md:text-5xl font-extralight font-mono transition-opacity duration-300 ${isPlayingLeft ? "text-foreground opacity-100 font-normal scale-105" : "text-muted-foreground opacity-30"}`}>
                  L
                </div>
                <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground block">Left Channel</span>
              </div>
              
              <div className="w-[1px] h-12 bg-border/60" />

              <div className="space-y-1 z-10">
                <div className={`text-3xl md:text-5xl font-extralight font-mono transition-opacity duration-300 ${isPlayingRight ? "text-foreground opacity-100 font-normal scale-105" : "text-muted-foreground opacity-30"}`}>
                  R
                </div>
                <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground block">Right Channel</span>
              </div>
            </div>

            {/* Stereo test triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <button
                onClick={playLeftChannel}
                className={`py-3 px-4 rounded border transition-apple-spring ${
                  isPlayingLeft
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-foreground hover:border-foreground"
                }`}
              >
                Left Channel Only
              </button>

              <button
                onClick={handlePlayStandard}
                className={`py-3 px-4 rounded border transition-apple-spring flex items-center justify-center gap-1.5 ${
                  isPlaying
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-foreground hover:border-foreground"
                }`}
              >
                {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                {isPlaying ? "Stop Tone" : "Both Channels"}
              </button>

              <button
                onClick={playRightChannel}
                className={`py-3 px-4 rounded border transition-apple-spring ${
                  isPlayingRight
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-foreground hover:border-foreground"
                }`}
              >
                Right Channel Only
              </button>
            </div>

            {/* White Noise Test */}
            <button
              onClick={isPlayingNoise ? stop : playNoise}
              className={`w-full py-3.5 rounded border transition-apple-spring text-xs font-mono flex items-center justify-center gap-1.5 ${
                isPlayingNoise
                  ? "border-destructive text-destructive hover:bg-destructive/5"
                  : "border-border text-foreground hover:border-foreground"
              }`}
            >
              <Radio className="w-4 h-4" />
              {isPlayingNoise ? "Stop Noise Check" : "Test Flat White Noise"}
            </button>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border/60 pt-6">
              
              {/* Frequency slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Sliders className="w-3 h-3" /> Pitch frequency</span>
                  <span className="font-semibold text-foreground">{localFreq} Hz</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="4000"
                  step="50"
                  value={localFreq}
                  onChange={handleFreqChange}
                  className="w-full h-0.5 bg-border rounded-lg appearance-none cursor-pointer accent-foreground"
                />
                <div className="flex justify-between font-mono text-[8px] text-muted-foreground">
                  <span>100Hz (Bass)</span>
                  <span>4kHz (Treble)</span>
                </div>
              </div>

              {/* Volume slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    {localVol === 0 ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    Master Volume
                  </span>
                  <span className="font-semibold text-foreground">{localVol}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={localVol}
                  onChange={handleVolChange}
                  className="w-full h-0.5 bg-border rounded-lg appearance-none cursor-pointer accent-foreground"
                />
                <div className="flex justify-between font-mono text-[8px] text-muted-foreground">
                  <span>Mute</span>
                  <span>Max</span>
                </div>
              </div>
            </div>

            {/* Output device mapping */}
            {devices.length > 0 && (
              <div className="border-t border-border/60 pt-6">
                <label htmlFor="speaker-select" className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block mb-2 font-mono">
                  Output Routing Address (Supported Browsers)
                </label>
                <select
                  id="speaker-select"
                  value={activeDeviceId}
                  onChange={(e) => selectDevice(e.target.value)}
                  className="w-full bg-transparent border border-border text-xs px-3.5 py-2.5 rounded focus:outline-none focus:border-foreground text-foreground"
                >
                  <option value="default">Default System Audio Out</option>
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Speaker Output (${device.deviceId.slice(0, 5)})`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <AdSlot id="speaker-minimal-sidebar" format="rectangle" />

          <div className="p-6 border border-border rounded-xl space-y-4 transition-apple-spring hover-apple-lift">
            <h3 className="font-medium text-sm text-foreground">Acoustic Specs</h3>
            <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong>Frequency response:</strong> The standard testing scope spans from deep bass ranges (100Hz) up to high treble (4000Hz) to query driver resonance.
              </p>
              <p>
                <strong>Stereo orientation:</strong> Ensure you hear audio distinctively matching the L and R visuals. Reversing headphone channels affects spatial orientation in gaming and communications.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: FREQUENCY RANGE GUIDE */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <span className="font-mono text-[9px] uppercase tracking-widest font-semibold text-muted-foreground block">
            01 / Audio Ranges
          </span>
          <h2 className="text-xl font-light text-foreground">
            Frequency Response & Balance
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Understand how different frequency pitches interact with speaker drivers and headphones during audio testing.
          </p>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 border border-border rounded-xl space-y-3 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground font-mono">
              <Music className="w-3.5 h-3.5 text-muted-foreground" />
              <h4 className="font-medium text-xs uppercase tracking-wider">Acoustic Spectrum Bands</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Bass (100Hz - 250Hz):</strong> Low-end frequencies testing speaker cabinet build and driver limits. Heavy vibrations are normal.<br />
              <strong>Midrange (500Hz - 2kHz):</strong> The core range for speech and vocals. Vital for teleconferencing clarity.<br />
              <strong>Treble (3kHz - 4kHz):</strong> High-end pitch frequencies checks driver crispness. Be careful with volume when testing high treble.
            </p>
          </div>

          <div className="p-6 border border-border rounded-xl space-y-3 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground font-mono">
              <Sliders className="w-3.5 h-3.5 text-muted-foreground" />
              <h4 className="font-medium text-xs uppercase tracking-wider">Panning & Spatialization</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Stereo Separation:</strong> Sending tone specifically to either Left or Right channel checks physical headphone position correctness.<br />
              <strong>Mono Compatibility:</strong> Playing equal signals in both channels should center the sound stage, ensuring drivers are in phase.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: SPEAKER TROUBLESHOOTING BLUEPRINT */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <span className="font-mono text-[9px] uppercase tracking-widest font-semibold text-muted-foreground block">
            02 / Diagnostics
          </span>
          <h2 className="text-xl font-light text-foreground">
            Troubleshooting Blueprint
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Troubleshoot common reasons for silence, crackles, or one-sided playback.
          </p>
        </div>

        <div className="md:col-span-2 space-y-4 font-mono text-xs">
          <div className="p-5 border border-border rounded-xl space-y-2 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground text-[10px] uppercase font-bold tracking-wider">
              <VolumeX className="w-3.5 h-3.5 text-muted-foreground inline" /> 1. System Level Muting
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
              Double-check that your computer master volume is active and unmuted. If using external speakers or monitors, check their physical volume knobs or power status indicators.
            </p>
          </div>

          <div className="p-5 border border-border rounded-xl space-y-2 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground text-[10px] uppercase font-bold tracking-wider">
              <Play className="w-3.5 h-3.5 text-muted-foreground inline" /> 2. Browser Autoplay Blocks
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
              Modern browsers block websites from playing audio automatically before user interaction. Make sure you explicitly clicked the "Left Channel Only", "Both Channels", or "Test Flat White Noise" button to authorize Web Audio contexts.
            </p>
          </div>

          <div className="p-5 border border-border rounded-xl space-y-2 hover-apple-lift transition-apple-spring">
            <div className="flex items-center gap-2 text-foreground text-[10px] uppercase font-bold tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-muted-foreground inline" /> 3. Sound Routing Addresses
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
              Navigate to System Settings &rarr; Sound &rarr; Output (macOS) or Settings &rarr; Sound (Windows) to verify that your audio routing is pointing to the correct headphones, monitors, or built-in speakers.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: BROWSER SPEAKER FAQS */}
      <section className="scroll-reveal border-t border-border/80 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">Help docs</span>
          <h2 className="text-2xl font-light tracking-tight text-foreground">Speaker Help FAQs</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
            Frequently asked questions about speaker channels, mono settings, and frequency sweeps.
          </p>
        </div>

        <div className="md:col-span-2 divide-y divide-border/60">
          {SPEAKER_FAQS.map((faq, idx) => {
            const isOpen = activeSpeakerFaq === idx;
            return (
              <div key={idx} className="py-4 first:pt-0 last:pb-0">
                <button
                  onClick={() => setActiveSpeakerFaq(isOpen ? null : idx)}
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

      {/* Recommended Headsets list */}
      <AffiliateRecommendations category="speaker" />
    </div>
  );
}
