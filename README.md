# CamMicTest.com - Free Browser Device Testing Platform

**CamMicTest.com** is a modern, fast, and SEO-optimized web application built with **Next.js 15+ (App Router)**, **TypeScript**, and **Tailwind CSS v4**. It allows users to diagnose their media hardware (webcam, microphone, speakers) and check their internet speed instantly, with 100% user privacy.

---

## 🚀 Key Features

### 1. 🎥 Webcam Test
* Real-time camera preview using the HTML5 `MediaDevices.getUserMedia` API.
* Dynamic detection of camera attributes (active resolution dimensions and live FPS counters).
* Fullscreen view and snapshot capture capabilities.
* Direct media track switching dropdown.

### 2. 🎤 Microphone Test
* Real-time vocal signal visualization (flowing waveforms and frequency bars) utilizing Canvas rendering tied directly to Web Audio `AnalyserNode`.
* Decibel metering scaling input amplitude percentage.
* Audio voice recording and playback mechanism for manual quality checks.

### 3. 🔊 Speaker Test
* Local Web Audio API tone synthesis (1000Hz standard oscillator tones and panning channels).
* Split Stereo Left / Right audio balances.
* Continuous white noise checks.
* Frequency sliders and output selection.

### 4. ⚡ Internet Speed Test
* Multi-stage diagnostic measuring latency (Ping), jitter, download speed, and upload speed.
* Custom, uncacheable streaming download (`/api/speedtest/download`) and upload endpoints.
* Visual SVG dial speedometers showing live bandwidth speeds.
* Local historical records logged in `localStorage`.

### 5. 🛠️ All-in-One Guided Wizard
* A 6-step testing wizard that inspects the browser environment, tests the webcam, microphone, speakers, and connection speed in sequence, and generates a printable PDF diagnostic scorecard.

---

## 📁 Repository Structure

```
CamMicTest.com/
├── src/
│   ├── app/                      # App Router directories and API routes
│   │   ├── api/
│   │   │   └── speedtest/        # Speed test latency, upload, & download streams
│   │   │       ├── download/
│   │   │       ├── ping/
│   │   │       └── upload/
│   │   ├── blog/                 # SEO guides (Black screens, Permissions guides)
│   │   ├── contact/              # Support message form
│   │   ├── device-check/         # All-in-One diagnostics wizard
│   │   ├── faq/                  # Interactive accordion questions list
│   │   ├── microphone-test/      # Mic test waveforms and recorder
│   │   ├── privacy/              # Privacy statements
│   │   ├── results/              # Diagnostics report card
│   │   ├─- speaker-test/         # Sound panner oscillator controls
│   │   ├── speed-test/           # Speedometers and history tables
│   │   └── layout.tsx            # Header, Footer, and Next.js viewports
│   ├── components/
│   │   ├── diagnostics/          # AudioVisualizer, Speedometer
│   │   ├── layout/               # Header, Footer, AdSlot, AffiliateCard
│   │   └── seo/                  # JSON-LD Schema markup helpers
│   ├── hooks/                    # Reusable Web API React hooks
│   │   ├── useMicrophone.ts      # Volume metering, MediaRecorder streams
│   │   ├── useSpeaker.ts         # AudioContext osc nodes, StereoPanner
│   │   ├── useSpeedTest.ts       # Ping cycles, download streams, XHR uploads
│   │   ├── useSystemDiagnostics.ts # UA compiler, device listings
│   │   └── useWebcam.ts          # Video stream tracks, FPS monitors
│   └── lib/                      # Helper methods
```

---

## 🛠️ Installation & Local Running

1. Clone or navigate into the workspace:
   ```bash
   cd /Users/syedsameedabbas/Documents/Antigravity/CamMicTest.com
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Run the hot-reloading development server:
   ```bash
   npm run dev
   ```

4. Build the application for production optimization:
   ```bash
   npm run build
   ```

5. Deploy on **Vercel** or other static/edge hosting systems instantly.
