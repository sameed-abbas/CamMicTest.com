"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface WebcamState {
  stream: MediaStream | null;
  activeDevice: MediaDeviceInfo | null;
  devices: MediaDeviceInfo[];
  resolution: { width: number; height: number } | null;
  settingsFps: number | null;
  liveFps: number;
  permissionStatus: "prompt" | "granted" | "denied";
  loading: boolean;
  error: string | null;
}

export function useWebcam() {
  const [state, setState] = useState<WebcamState>({
    stream: null,
    activeDevice: null,
    devices: [],
    resolution: null,
    settingsFps: null,
    liveFps: 0,
    permissionStatus: "prompt",
    loading: false,
    error: null,
  });

  const streamRef = useRef<MediaStream | null>(null);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateTimeRef = useRef<number>(0);
  const fpsRequestFrameRef = useRef<number | null>(null);

  // Stop current stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (fpsRequestFrameRef.current !== null) {
      cancelAnimationFrame(fpsRequestFrameRef.current);
      fpsRequestFrameRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      stream: null,
      resolution: null,
      settingsFps: null,
      liveFps: 0,
    }));
  }, []);

  // Enumerate cameras
  const updateDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((device) => device.kind === "videoinput");
      setState((prev) => ({ ...prev, devices: videoDevices }));
      return videoDevices;
    } catch {
      return [];
    }
  }, []);

  // Start webcam stream
  const startStream = useCallback(async (deviceId?: string) => {
    stopStream();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    if (typeof window === "undefined" || !navigator.mediaDevices) {
      setState((prev) => ({
        ...prev,
        loading: false,
        permissionStatus: "denied",
        error: "Media devices API not supported.",
      }));
      return null;
    }

    const constraints: MediaStreamConstraints = {
      video: deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        : { width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false, // Webcam test is video only
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const currentDevices = await updateDevices();

      // Find active device info
      let activeDevice = currentDevices.find(
        (d) => d.label === videoTrack.label || (deviceId && d.deviceId === deviceId)
      ) || null;

      if (!activeDevice && currentDevices.length > 0) {
        // Fallback matching
        activeDevice = currentDevices.find((d) => d.deviceId === settings.deviceId) || currentDevices[0];
      }

      setState((prev) => ({
        ...prev,
        stream,
        activeDevice,
        resolution: {
          width: settings.width || 0,
          height: settings.height || 0,
        },
        settingsFps: settings.frameRate || null,
        permissionStatus: "granted",
        loading: false,
      }));

      // Start live FPS tracking
      lastFpsUpdateTimeRef.current = performance.now();
      frameCountRef.current = 0;

      const trackFps = () => {
        frameCountRef.current += 1;
        const now = performance.now();
        const delta = now - lastFpsUpdateTimeRef.current;

        if (delta >= 1000) {
          const computedFps = Math.round((frameCountRef.current * 1000) / delta);
          setState((prev) => ({ ...prev, liveFps: computedFps }));
          frameCountRef.current = 0;
          lastFpsUpdateTimeRef.current = now;
        }

        fpsRequestFrameRef.current = requestAnimationFrame(trackFps);
      };

      fpsRequestFrameRef.current = requestAnimationFrame(trackFps);
      return stream;
    } catch (err) {
      stopStream();
      const errorMessage = err instanceof Error ? err.message : "Failed to access webcam.";
      let permissionState: "denied" | "prompt" = "prompt";

      if (
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")
      ) {
        permissionState = "denied";
      }

      setState((prev) => ({
        ...prev,
        permissionStatus: permissionState,
        error: errorMessage,
        loading: false,
      }));
      return null;
    }
  }, [stopStream, updateDevices]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    ...state,
    start: startStream,
    stop: stopStream,
    refreshDevices: updateDevices,
  };
}
