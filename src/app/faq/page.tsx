"use client";

import React, { useState } from "react";
import SchemaMarkup, { getFAQSchema } from "@/components/seo/SchemaMarkup";
import AdSlot from "@/components/layout/AdSlot";
import { HelpCircle, ChevronDown, Video, Mic, Headphones, Shield, HelpCircle as QuestionMark } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
  category: "general" | "webcam" | "microphone" | "speaker" | "privacy";
}

const FAQS: FAQItem[] = [
  {
    category: "general",
    q: "Is there any software installation needed for these checks?",
    a: "No, CamMicTest.com is a 100% web-based diagnostic utility. It uses built-in browser media APIs like WebRTC, HTML5 MediaDevices, and Web Audio API to communicate with your hardware directly. You do not need to download or install any browser extensions or EXE/DMG desktop programs."
  },
  {
    category: "webcam",
    q: "My webcam shows a black screen. How do I fix this?",
    a: "A black webcam frame is typically due to three issues: (1) The camera access is blocked in your browser preferences. Look for a padlock symbol in your browser URL input bar, click it, and change Camera access to 'Allow'. (2) Another software program (like Zoom, MS Teams, Skype, or Discord) is currently using the camera track. Close these background tools and refresh the page. (3) A physical slider toggle is covering the lens."
  },
  {
    category: "webcam",
    q: "Can I test multiple webcams connected to my computer?",
    a: "Yes. Once you initiate the camera test and grant permissions, the page will list all connected video inputs in a dropdown select box. Simply select the specific camera you want to inspect, and our tool will re-initiate the stream and display its properties."
  },
  {
    category: "webcam",
    q: "How do I unblock camera and microphone settings on macOS?",
    a: "On macOS, you must grant permission at both the operating system level and browser level. Go to System Settings &rarr; Privacy & Security &rarr; Camera (and Microphone), and make sure your browser (Google Chrome, Safari, Firefox, or Microsoft Edge) is checked and permitted to access your hardware. Then refresh the browser page."
  },
  {
    category: "webcam",
    q: "How do I allow desktop apps to access my camera and mic on Windows 10/11?",
    a: "Go to Start &rarr; Settings &rarr; Privacy & Security &rarr; Camera (and Microphone). Ensure 'Camera access' is toggled ON, and check that 'Let apps access your camera' and 'Let desktop apps access your camera' are both enabled. Perform the same checks for your Microphone, then refresh the test page."
  },
  {
    category: "microphone",
    q: "Why is the microphone waveform visualizer flat (no audio detected)?",
    a: "Verify that the microphone is not muted via a physical hardware toggle or a volume knob on the mic itself. Next, check your computer's System Settings &rarr; Sound &rarr; Input and verify that the correct microphone is set as active. Lastly, make sure you clicked 'Allow' on the browser's permission prompt."
  },
  {
    category: "microphone",
    q: "Can I listen to my own voice to test mic quality?",
    a: "Yes! Our Microphone Test page includes a voice recorder tool. Click 'Record Voice Check', speak for a few seconds, and click 'Stop Recording'. You can immediately play back the clip to check for echoes, static noise, or clipping distortion."
  },
  {
    category: "microphone",
    q: "How do I fix microphone static background noise, echo, or high-pitch buzz?",
    a: "Static noise or hums are typically caused by: (1) Microphone input gain set too high in OS sound settings, (2) Poor electrical shielding on 3.5mm headphone jacks or USB hubs, (3) Lack of acoustic echo cancellation. Go to your computer's Sound Settings, reduce the input volume/gain to 70-80%, and enable 'Acoustic Echo Cancellation' or 'Noise Suppression' if available."
  },
  {
    category: "speaker",
    q: "How does the speaker panner test work?",
    a: "The speaker test uses Web Audio API synthesis. When you select 'Left Channel' or 'Right Channel', our synthesizer uses a StereoPannerNode to route a pure 1000Hz tone only to that specific audio channel. This allows you to verify that your headphones, earbuds, or speakers are oriented on the correct sides and have equal output levels."
  },
  {
    category: "speaker",
    q: "Why do I hear the sound in both ears when testing only the left or right channel?",
    a: "If a single-channel test plays in both ears, check if 'Mono Audio' is turned on in your computer or phone's Accessibility settings. When Mono Audio is enabled, the operating system mixes left and right audio channels together into a single combined channel, preventing stereo separation."
  },
  {
    category: "privacy",
    q: "Is my webcam feed or voice stream recorded or saved?",
    a: "No. Your privacy is our top priority. We do not record, stream, transmit, or save any video or audio data to our servers. The browser process handles all streams locally in your device memory, and once the test page is closed, the media tracks are terminated."
  },
  {
    category: "general",
    q: "Why is my camera or mic not working in Zoom or Meet even if it works here?",
    a: "If your hardware works on CamMicTest.com, your camera and mic are physically functional. App-specific bugs are usually caused by inside settings. In Zoom, MS Teams, or Google Meet, click Settings &rarr; Video/Audio and verify that the correct active microphone and camera source are selected from their dropdown lists, as they do not always match browser defaults."
  },
  {
    category: "general",
    q: "Can I test my iPhone, iPad, or Android phone's hardware here?",
    a: "Yes. CamMicTest.com is mobile-responsive. Simply load our site in Apple Safari (on iOS) or Google Chrome (on Android). The browser will trigger a secure permission prompt, allowing you to test the front/rear cameras, microphone arrays, and speaker outputs on any mobile device."
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<"all" | "general" | "webcam" | "microphone" | "speaker" | "privacy">("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = FAQS.filter(
    (faq) => activeCategory === "all" || faq.category === activeCategory
  );

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Schema FAQ markup for search engine rich snippets */}
      <SchemaMarkup schema={getFAQSchema(FAQS.map(f => ({ q: f.q, a: f.a })))} />

      {/* Title */}
      <section className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl flex items-center gap-2">
          <HelpCircle className="w-8 h-8 text-primary animate-pulse" /> Frequently Asked Questions
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Stuck during a diagnostic check? Review troubleshooting guides for camera settings, microphone permissions, speaker channel balances, and network issues.
        </p>
      </section>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 border-b border-border/40 pb-4 select-none">
        {(["all", "general", "webcam", "microphone", "speaker", "privacy"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setOpenIndex(null);
            }}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {cat === "all" ? "Show All FAQs" : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Accordion List */}
        <div className="lg:col-span-2 space-y-3.5">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-card border border-border/45 rounded-2xl overflow-hidden hover:border-border transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-sm text-foreground hover:bg-secondary/20 transition-all"
                >
                  <span className="flex items-center gap-2.5">
                    {faq.category === "webcam" && <Video className="w-4 h-4 text-indigo-500" />}
                    {faq.category === "microphone" && <Mic className="w-4 h-4 text-emerald-500" />}
                    {faq.category === "speaker" && <Headphones className="w-4 h-4 text-amber-500" />}
                    {faq.category === "privacy" && <Shield className="w-4 h-4 text-primary" />}
                    {faq.category === "general" && <QuestionMark className="w-4 h-4 text-cyan-500" />}
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/30 animate-in slide-in-from-top-2 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar ads */}
        <div className="space-y-6">
          <AdSlot id="faq-sidebar-rect" format="rectangle" />
        </div>
      </div>
    </div>
  );
}
