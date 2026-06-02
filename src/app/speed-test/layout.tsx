import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Internet Speed Test - Measure Download & Upload Bandwidth",
  description: "Check your internet connection speed. Measure download speed, upload speed, latency (ping), and network stability (jitter) with Cloudflare edge accuracy.",
  alternates: {
    canonical: "https://cammictest.com/speed-test",
  },
  openGraph: {
    title: "Internet Speed Test - Measure Download & Upload Bandwidth",
    description: "Measure download speeds, upload bandwidth, response ping, and jitter stability instantly with CDN edge-node precision.",
    url: "https://cammictest.com/speed-test",
  }
};

export default function SpeedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
