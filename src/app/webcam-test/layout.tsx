import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webcam Test Online - Test Your Camera & Check FPS",
  description: "Test your webcam online for free. Check camera resolution, live frame rate (FPS), and troubleshoot webcam black screen errors directly in your browser.",
  alternates: {
    canonical: "https://cammictest.com/webcam-test",
  },
  openGraph: {
    title: "Webcam Test Online - Test Your Camera & Check FPS",
    description: "Verify your camera works, check resolution specs, measure frame rate (FPS), and run hardware diagnostics instantly.",
    url: "https://cammictest.com/webcam-test",
  }
};

export default function WebcamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
