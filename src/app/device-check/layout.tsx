import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All-in-One Device Diagnostics Check - Camera, Mic, & Audio",
  description: "Run a complete hardware scan on your computer. Guided step-by-step diagnostics for your webcam, microphone, sound speakers, and network connection.",
  alternates: {
    canonical: "https://cammictest.com/device-check",
  },
  openGraph: {
    title: "All-in-One Device Diagnostics Check - Camera, Mic, & Audio",
    description: "Run our guided, step-by-step wizard to diagnostic check your webcam feed, audio input, sound output, and network bandwidth in one go.",
    url: "https://cammictest.com/device-check",
  }
};

export default function DeviceCheckLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
