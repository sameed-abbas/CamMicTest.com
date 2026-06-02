import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions - Camera, Mic, & Browser Permissions FAQ",
  description: "Get answers to common webcam permission blocks, microphone background humming, stereo audio balance issues, and WebRTC hardware errors.",
  alternates: {
    canonical: "https://cammictest.com/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions - Camera, Mic, & Browser Permissions FAQ",
    description: "Troubleshoot device permission errors, WebRTC webcam problems, microphone hums, and speaker issues with our detailed support answers.",
    url: "https://cammictest.com/faq",
  }
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
