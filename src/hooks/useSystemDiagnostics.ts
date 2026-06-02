"use client";

import { useState, useEffect, useCallback } from "react";

export interface SystemInfo {
  browser: string;
  os: string;
  deviceType: "Mobile" | "Tablet" | "Desktop";
  screenResolution: string;
  viewportSize: string;
  networkType: string;
  downlink: string;
  rtt: string;
}

export interface DeviceItem {
  id: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface DiagnosticsState {
  system: SystemInfo | null;
  cameras: DeviceItem[];
  microphones: DeviceItem[];
  speakers: DeviceItem[];
  hasVideoPermission: boolean | null;
  hasAudioPermission: boolean | null;
  loading: boolean;
  error: string | null;
}

export function useSystemDiagnostics() {
  const [state, setState] = useState<DiagnosticsState>({
    system: null,
    cameras: [],
    microphones: [],
    speakers: [],
    hasVideoPermission: null,
    hasAudioPermission: null,
    loading: true,
    error: null,
  });

  const getSystemInfo = useCallback((): SystemInfo => {
    if (typeof window === "undefined") {
      return {
        browser: "Server-side",
        os: "Unknown",
        deviceType: "Desktop",
        screenResolution: "0x0",
        viewportSize: "0x0",
        networkType: "Unknown",
        downlink: "0 Mbps",
        rtt: "0 ms",
      };
    }

    const ua = navigator.userAgent;
    let browser = "Unknown";
    let os = "Unknown";

    // OS Detection
    if (/macintosh|mac os x/i.test(ua)) os = "macOS";
    else if (/windows|win32/i.test(ua)) os = "Windows";
    else if (/android/i.test(ua)) os = "Android";
    else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
    else if (/linux/i.test(ua)) os = "Linux";

    // Browser Detection
    if (/edg/i.test(ua)) browser = "Edge";
    else if (/chrome|crios/i.test(ua)) browser = "Chrome";
    else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
    else if (/safari/i.test(ua) && !/chrome|crios|edg/i.test(ua)) browser = "Safari";
    else if (/opera|opios|opr/i.test(ua)) browser = "Opera";

    // Device Type Detection
    const isMobile = /mobile|iphone|ipod|android/i.test(ua);
    const isTablet = /ipad|tablet/i.test(ua) || (os === "macOS" && navigator.maxTouchPoints > 0);
    const deviceType = isMobile ? "Mobile" : isTablet ? "Tablet" : "Desktop";

    // Screen and Viewport
    const screenResolution = `${window.screen.width} x ${window.screen.height}`;
    const viewportSize = `${window.innerWidth} x ${window.innerHeight}`;

    // Network Information (API supported in Chrome/Edge/Opera)
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const networkType = conn?.effectiveType || "Wifi/Cellular";
    const downlink = conn?.downlink ? `${conn.downlink} Mbps` : "Unknown";
    const rtt = conn?.rtt ? `${conn.rtt} ms` : "Unknown";

    return {
      browser,
      os,
      deviceType,
      screenResolution,
      viewportSize,
      networkType,
      downlink,
      rtt,
    };
  }, []);

  const queryDevices = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Media devices API not supported in this browser.",
      }));
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const cameras: DeviceItem[] = [];
      const microphones: DeviceItem[] = [];
      const speakers: DeviceItem[] = [];

      let hasVideo = false;
      let hasAudio = false;

      devices.forEach((device) => {
        const item: DeviceItem = {
          id: device.deviceId,
          label: device.label || `${device.kind === "videoinput" ? "Camera" : device.kind === "audioinput" ? "Microphone" : "Speaker"} (${device.deviceId.slice(0, 5)})`,
          kind: device.kind,
        };

        if (device.kind === "videoinput") {
          cameras.push(item);
          if (device.label) hasVideo = true;
        } else if (device.kind === "audioinput") {
          microphones.push(item);
          if (device.label) hasAudio = true;
        } else if (device.kind === "audiooutput") {
          speakers.push(item);
        }
      });

      // Permission Query via browser permissions API (where supported)
      let videoPerm: boolean | null = hasVideo ? true : null;
      let audioPerm: boolean | null = hasAudio ? true : null;

      if (navigator.permissions && navigator.permissions.query) {
        try {
          const videoRes = await navigator.permissions.query({ name: "camera" as any });
          videoPerm = videoRes.state === "granted";
          
          const audioRes = await navigator.permissions.query({ name: "microphone" as any });
          audioPerm = audioRes.state === "granted";
        } catch {
          // Permissions query might throw if exact name is unsupported
        }
      }

      setState((prev) => ({
        ...prev,
        system: getSystemInfo(),
        cameras,
        microphones,
        speakers,
        hasVideoPermission: videoPerm,
        hasAudioPermission: audioPerm,
        loading: false,
        error: null,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        system: getSystemInfo(),
        loading: false,
        error: err instanceof Error ? err.message : "Error querying media devices.",
      }));
    }
  }, [getSystemInfo]);

  useEffect(() => {
    queryDevices();

    // Listen for device changes
    if (typeof window !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener("devicechange", queryDevices);
      return () => {
        navigator.mediaDevices.removeEventListener("devicechange", queryDevices);
      };
    }
  }, [queryDevices]);

  const requestPermissions = async (type: "video" | "audio" | "both") => {
    try {
      const constraints: MediaStreamConstraints = {
        video: type === "video" || type === "both",
        audio: type === "audio" || type === "both",
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // Immediately stop track to release resource
      stream.getTracks().forEach((track) => track.stop());
      
      // Re-query devices to get descriptive labels
      await queryDevices();
      return true;
    } catch (err) {
      await queryDevices();
      return false;
    }
  };

  return {
    ...state,
    refresh: queryDevices,
    requestPermissions,
  };
}
