import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ExportToolbar from "@/components/diagnostics/ExportToolbar";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CamMicTest.com - Free Webcam, Microphone, & Speaker Test Online",
    template: "%s | CamMicTest.com"
  },
  description: "Test your webcam, microphone, speakers, and internet connection directly in your browser. Fast, secure, and free online hardware diagnostic check.",
  keywords: [
    "webcam test",
    "microphone test",
    "mic test online",
    "speaker test",
    "camera test online",
    "test my webcam",
    "test my microphone",
    "internet speed test",
    "browser device test"
  ],
  authors: [{ name: "CamMicTest Team" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cammictest.com",
    title: "CamMicTest.com - Free Webcam, Microphone & Speaker Test Online",
    description: "Verify your webcam, microphone, sound speakers, and internet speed instantly. Run our all-in-one browser hardware check for absolute privacy.",
    siteName: "CamMicTest.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "CamMicTest.com - Free Webcam, Microphone & Speaker Test Online",
    description: "Verify your webcam, microphone, sound speakers, and internet speed instantly. Run our all-in-one browser hardware check for absolute privacy.",
  },
  alternates: {
    canonical: "https://cammictest.com",
  }
};

import type { Viewport } from "next";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
          <ExportToolbar />
        </ThemeProvider>
      </body>
    </html>
  );
}
