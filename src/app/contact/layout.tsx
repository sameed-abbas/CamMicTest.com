import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Support - Get Hardware Assistance",
  description: "Have questions about your camera, microphone, or audio diagnostics scan? Send us a message and our support engineering team will assist you.",
  alternates: {
    canonical: "https://cammictest.com/contact",
  },
  openGraph: {
    title: "Contact Support - Get Hardware Assistance",
    description: "Get in touch with the support team for any device scanning, permission issues, or general hardware diagnostic questions.",
    url: "https://cammictest.com/contact",
  }
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
