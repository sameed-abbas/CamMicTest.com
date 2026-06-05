"use client";

import React, { useState, useEffect } from "react";
import { Cookie, Shield, Check, X, Settings } from "lucide-react";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
}

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
  });

  // Check if consent has already been given on mount
  useEffect(() => {
    const storedConsent = localStorage.getItem("cammictest_cookie_consent");
    if (!storedConsent) {
      // Small timeout to make it feel smooth on initial load
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(storedConsent);
        setPreferences(parsed);
      } catch (e) {
        // Fallback if parsing fails
      }
    }
  }, []);

  // Listen to open-cookie-settings event
  useEffect(() => {
    const handleOpenSettings = () => {
      setShowSettings(true);
      setIsVisible(true);
    };

    window.addEventListener("open-cookie-settings", handleOpenSettings);
    return () => window.removeEventListener("open-cookie-settings", handleOpenSettings);
  }, []);

  const handleAcceptAll = () => {
    const allPreferences = { essential: true, analytics: true };
    saveConsent(allPreferences);
  };

  const handleRejectAll = () => {
    const essentialOnly = { essential: true, analytics: false };
    saveConsent(essentialOnly);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem("cammictest_cookie_consent", JSON.stringify(prefs));
    // Set cookie as well for server reference if needed
    document.cookie = `cammictest_consent=${JSON.stringify(prefs)}; path=/; max-age=31536000; SameSite=Lax; Secure`;
    
    // Dispatch event to notify AnalyticsTracker
    window.dispatchEvent(
      new CustomEvent("cookie-consent-updated", { detail: prefs })
    );

    setIsVisible(false);
    setShowSettings(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="bg-neutral-950/85 backdrop-blur-md border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Banner Header */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 border border-primary/25 rounded-2xl shrink-0 text-primary">
            <Cookie className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Cookie Consent <span className="text-[10px] text-primary font-mono tracking-widest uppercase">GDPR</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use cookies to verify browser hardware configurations, secure administrative sessions, and analyze site usage with click heatmaps.
            </p>
          </div>
        </div>

        {/* Dynamic Preference Mode */}
        {showSettings ? (
          <div className="space-y-4 pt-2 border-t border-neutral-900 animate-in fade-in duration-300">
            <h4 className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
              Manage Preferences
            </h4>

            {/* Essential Toggles */}
            <div className="flex items-start justify-between p-3.5 bg-neutral-900/30 border border-neutral-900 rounded-2xl gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" /> Essential Cookies
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Required for site navigation, security credentials, 2FA authorization, and saving your preferences. Cannot be disabled.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Always On
              </span>
            </div>

            {/* Analytics Toggles */}
            <div className="flex items-start justify-between p-3.5 bg-neutral-900/30 border border-neutral-900 rounded-2xl gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-primary" /> Analytics & Heatmaps
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Allows us to log visitor paths and aggregate click coordinates to improve page layouts and diagnostics workflows.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 pt-0.5">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences({ ...preferences, analytics: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[2px] after:bg-neutral-400 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
              </label>
            </div>

            {/* Preference Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSavePreferences}
                className="flex-1 text-[10px] font-bold uppercase tracking-wider py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Save Preferences
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 text-[10px] font-bold uppercase tracking-wider py-2.5 bg-neutral-900 hover:bg-neutral-800 text-foreground rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Normal Action Mode */
          <div className="flex flex-col gap-2 pt-2 border-t border-neutral-900">
            <div className="flex items-center gap-2">
              <button
                onClick={handleAcceptAll}
                className="flex-1 text-[10px] font-bold uppercase tracking-wider py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectAll}
                className="flex-1 text-[10px] font-bold uppercase tracking-wider py-2.5 bg-neutral-900 hover:bg-neutral-800 text-foreground border border-neutral-800 rounded-xl transition-all"
              >
                Reject All
              </button>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="text-[10px] font-bold text-muted-foreground hover:text-foreground text-center py-1.5 transition-all flex items-center justify-center gap-1.5"
            >
              <Settings className="w-3 h-3" /> Cookie Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
