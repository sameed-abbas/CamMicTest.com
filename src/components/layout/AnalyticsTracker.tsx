"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Helper to determine device type from User Agent
function getDeviceType(): string {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

// Helper to get browser name from User Agent
function getBrowserName(): string {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("SamsungBrowser")) return "Samsung Browser";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  if (ua.includes("Trident")) return "Internet Explorer";
  if (ua.includes("Edge") || ua.includes("Edg")) return "Microsoft Edge";
  if (ua.includes("Chrome")) return "Google Chrome";
  if (ua.includes("Safari")) return "Apple Safari";
  return "unknown";
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const clickBuffer = useRef<{ x: number; y: number; url: string; viewportWidth: number; viewportHeight: number }[]>([]);
  const hasTrackedPageView = useRef<string | null>(null);
  const [hasConsent, setHasConsent] = useState<boolean>(false);

  // Disable tracking on admin routes to prevent self-analytics bloating
  const disableTracking = pathname.startsWith("/admin") || pathname.startsWith("/api");

  // Read consent status
  useEffect(() => {
    const checkConsent = () => {
      const stored = localStorage.getItem("cammictest_cookie_consent");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setHasConsent(!!parsed.analytics);
        } catch (e) {
          setHasConsent(false);
        }
      } else {
        setHasConsent(false);
      }
    };

    // Initial check
    checkConsent();

    // Listen for updates
    const handleConsentUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setHasConsent(!!customEvent.detail.analytics);
      }
    };

    window.addEventListener("cookie-consent-updated", handleConsentUpdate);
    return () => window.removeEventListener("cookie-consent-updated", handleConsentUpdate);
  }, []);

  // Track Page Views (gated by consent)
  useEffect(() => {
    if (disableTracking || !hasConsent) return;

    // Avoid duplicate pageview logs for the same path
    if (hasTrackedPageView.current === pathname) return;

    const trackPageView = async () => {
      try {
        const payload = {
          url: pathname,
          referrer: document.referrer || "",
          device: getDeviceType(),
          browser: getBrowserName(),
        };

        hasTrackedPageView.current = pathname;

        await fetch("/api/admin/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "pageview", payload }),
          keepalive: true
        });
      } catch (e) {
        // Silently capture errors to avoid UX disruption
      }
    };

    trackPageView();
  }, [pathname, disableTracking, hasConsent]);

  // Reset pageview track flag on path change
  useEffect(() => {
    if (pathname !== hasTrackedPageView.current) {
      hasTrackedPageView.current = null;
    }
  }, [pathname]);

  // Track Clicks with a throttled buffer (gated by consent)
  useEffect(() => {
    if (disableTracking || !hasConsent) {
      clickBuffer.current = []; // Clear buffer if disabled/consent revoked
      return;
    }

    // Send click coordinates buffer to server
    const flushClicks = async () => {
      if (clickBuffer.current.length === 0) return;

      const clicksToSend = [...clickBuffer.current];
      clickBuffer.current = []; // Clear buffer

      for (const click of clicksToSend) {
        try {
          await fetch("/api/admin/analytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "click", payload: click }),
            keepalive: true
          });
        } catch (e) {
          // Push back to buffer on failure
          clickBuffer.current.push(click);
          break;
        }
      }
    };

    // Listen for mouse click coordinates (as percentage offsets of total page)
    const handleDocumentClick = (e: MouseEvent) => {
      // Double check consent state
      if (!hasConsent) return;

      // Skip clicks on inputs or buttons inside interactive tools to avoid capture noise
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" || 
        target.tagName === "SELECT" || 
        target.tagName === "TEXTAREA" ||
        target.closest("button")
      ) {
        return;
      }

      const docWidth = document.documentElement.scrollWidth || document.body.scrollWidth || 1;
      const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 1;

      // Absolute coordinates (including scroll offsets)
      const xPercent = (e.pageX / docWidth) * 100;
      const yPercent = (e.pageY / docHeight) * 100;

      clickBuffer.current.push({
        url: pathname,
        x: parseFloat(xPercent.toFixed(2)),
        y: parseFloat(yPercent.toFixed(2)),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      });

      // Flush immediately if buffer reaches 5 events
      if (clickBuffer.current.length >= 5) {
        flushClicks();
      }
    };

    // Flush any pending clicks on tab close/unload
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushClicks();
      }
    };

    window.addEventListener("click", handleDocumentClick);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Set a periodic flush interval (every 10 seconds)
    const interval = setInterval(flushClicks, 10000);

    return () => {
      window.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
      // Final flush on unmount
      flushClicks();
    };
  }, [pathname, disableTracking, hasConsent]);

  return null;
}
