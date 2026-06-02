import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnostic Scan Report | CamMicTest.com",
  description: "View your local hardware diagnostic check results and download the detailed system compatibility report.",
  robots: {
    index: false,
    follow: false,
  }
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
