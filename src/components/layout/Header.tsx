"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme as useNextTheme } from "next-themes";
import { Sun, Moon, Menu, X } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "/webcam-test", label: "Camera" },
    { href: "/microphone-test", label: "Microphone" },
    { href: "/speaker-test", label: "Audio" },
    { href: "/speed-test", label: "Speed Test" },
    { href: "/device-check", label: "Diagnostics" },
  ];

  return (
    <header className="w-full bg-neutral-950 border-b border-neutral-800 sticky top-0 z-50 transition-editorial">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Link with Permanent White Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img 
            src="/logo-white.png" 
            alt="CamMicTest.com Logo" 
            className="h-14 w-auto" 
          />
        </Link>

        {/* Desktop Navigation - Static Light Text on Black Header */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] font-normal tracking-wide transition-colors py-1 ${
                  isActive
                    ? "text-white font-medium"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Utilities */}
        <div className="flex items-center gap-4">
          {/* Theme switcher */}
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="text-neutral-400 hover:text-white p-1.5 transition-colors"
              aria-label="Toggle visual theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Minimalist wireframe CTA (White on black header) */}
          <Link
            href="/device-check"
            className="hidden sm:inline-flex items-center justify-center border border-white bg-white text-black hover:bg-black hover:text-white text-[11px] font-medium tracking-wider uppercase px-4 py-1.5 rounded transition-colors duration-200"
          >
            Start Scan
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-neutral-400 hover:text-white p-1 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation - Permanent Black background */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-950 px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-normal tracking-wide transition-colors ${
                    isActive ? "text-white font-medium" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="pt-4 border-t border-neutral-800">
            <Link
              href="/device-check"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center border border-white bg-white text-black hover:bg-neutral-950 hover:text-white text-[11px] font-semibold tracking-wider uppercase py-2.5 rounded transition-colors"
            >
              Start Complete Scan
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
