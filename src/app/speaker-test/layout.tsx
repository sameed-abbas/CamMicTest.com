import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Speaker Test - Sound Panning & Left/Right Stereo Check",
  description: "Verify your speakers and headphones. Test left/right stereo channel balance, play standard frequency tones, and adjust audio panning balances.",
  alternates: {
    canonical: "https://cammictest.com/speaker-test",
  },
  openGraph: {
    title: "Speaker Test - Sound Panning & Left/Right Stereo Check",
    description: "Verify stereo speaker balance, test left and right sound channels, run frequency tone scans, and adjust headphone balances online.",
    url: "https://cammictest.com/speaker-test",
  }
};

export default function SpeakerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
