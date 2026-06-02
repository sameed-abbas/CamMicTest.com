"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface MicrophoneState {
  stream: MediaStream | null;
  activeDevice: MediaDeviceInfo | null;
  devices: MediaDeviceInfo[];
  volume: number; // 0 to 100 representing signal amplitude
  isRecording: boolean;
  recordingUrl: string | null;
  recordingDuration: number;
  permissionStatus: "prompt" | "granted" | "denied";
  loading: boolean;
  error: string | null;
}

export function useMicrophone() {
  const [state, setState] = useState<MicrophoneState>({
    stream: null,
    activeDevice: null,
    devices: [],
    volume: 0,
    isRecording: false,
    recordingUrl: null,
    recordingDuration: 0,
    permissionStatus: "prompt",
    loading: false,
    error: null,
  });

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
  const volumeAnimationFrameRef = useRef<number | null>(null);

  // Stop stream and clean up Web Audio context
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (volumeAnimationFrameRef.current !== null) {
      cancelAnimationFrame(volumeAnimationFrameRef.current);
      volumeAnimationFrameRef.current = null;
    }

    if (recordingIntervalRef.current !== null) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    // Stop and clean nodes
    try {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } catch (e) {
      console.error("Error closing AudioContext:", e);
    }

    setState((prev) => ({
      ...prev,
      stream: null,
      volume: 0,
      isRecording: false,
    }));
  }, []);

  const updateDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = allDevices.filter((device) => device.kind === "audioinput");
      setState((prev) => ({ ...prev, devices: audioDevices }));
      return audioDevices;
    } catch {
      return [];
    }
  }, []);

  // Start microphone stream and set up Web Audio analyser
  const startStream = useCallback(async (deviceId?: string) => {
    stopStream();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    if (typeof window === "undefined" || !navigator.mediaDevices) {
      setState((prev) => ({
        ...prev,
        loading: false,
        permissionStatus: "denied",
        error: "Media devices API not supported in this browser.",
      }));
      return null;
    }

    const constraints: MediaStreamConstraints = {
      audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      video: false,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const audioTrack = stream.getAudioTracks()[0];
      const currentDevices = await updateDevices();
      
      // Find active device info
      const settings = audioTrack.getSettings();
      let activeDevice = currentDevices.find(
        (d) => d.label === audioTrack.label || (deviceId && d.deviceId === deviceId)
      ) || null;

      if (!activeDevice && currentDevices.length > 0) {
        activeDevice = currentDevices.find((d) => d.deviceId === settings.deviceId) || currentDevices[0];
      }

      // Initialize Audio Context for visualization
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      setState((prev) => ({
        ...prev,
        stream,
        activeDevice,
        permissionStatus: "granted",
        loading: false,
      }));

      // Start volume meter polling via requestAnimationFrame
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(dataArray);

        // Calculate Root Mean Square (RMS) amplitude
        let total = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = (dataArray[i] - 128) / 128; // Normalize to -1..1
          total += val * val;
        }
        const rms = Math.sqrt(total / bufferLength);
        
        // Convert to percentage (0 - 100), magnifying low levels slightly for visual responsiveness
        const volumePercentage = Math.min(Math.round(rms * 250), 100);

        setState((prev) => ({ ...prev, volume: volumePercentage }));
        volumeAnimationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      volumeAnimationFrameRef.current = requestAnimationFrame(updateVolume);
      return stream;
    } catch (err) {
      stopStream();
      const errorMessage = err instanceof Error ? err.message : "Failed to access microphone.";
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

  // Audio Recording Functions
  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;

    audioChunksRef.current = [];
    
    // Cleanup old recording url
    setState((prev) => {
      if (prev.recordingUrl) {
        URL.revokeObjectURL(prev.recordingUrl);
      }
      return { ...prev, recordingUrl: null, recordingDuration: 0, isRecording: true };
    });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const recordingUrl = URL.createObjectURL(audioBlob);
      setState((prev) => ({
        ...prev,
        recordingUrl,
        isRecording: false,
      }));
    };

    mediaRecorder.start();

    // Start timer interval
    const startTime = Date.now();
    recordingIntervalRef.current = window.setInterval(() => {
      setState((prev) => ({
        ...prev,
        recordingDuration: Math.floor((Date.now() - startTime) / 1000),
      }));
    }, 1000);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (recordingIntervalRef.current !== null) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopStream();
      setState((prev) => {
        if (prev.recordingUrl) {
          URL.revokeObjectURL(prev.recordingUrl);
        }
        return prev;
      });
    };
  }, [stopStream]);

  return {
    ...state,
    start: startStream,
    stop: stopStream,
    analyserRef,
    startRecording,
    stopRecording,
    refreshDevices: updateDevices,
  };
}
