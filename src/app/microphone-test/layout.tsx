import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Microphone Test Online - Check Mic & Sound Recorder",
  description: "Check your microphone online for free. Test mic volume, view real-time voice waveforms, record a 5-second audio sample, and troubleshoot static humming issues.",
  alternates: {
    canonical: "https://cammictest.com/microphone-test",
  },
  openGraph: {
    title: "Microphone Test Online - Check Mic & Sound Recorder",
    description: "Verify your microphone works, check sound sensitivity levels, record and playback voice quality, and troubleshoot audio static online.",
    url: "https://cammictest.com/microphone-test",
  }
};

export default function MicrophoneLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
