"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface SpeakerState {
  isPlaying: boolean;
  isPlayingLeft: boolean;
  isPlayingRight: boolean;
  isPlayingNoise: boolean;
  frequency: number; // in Hz
  volume: number; // 0 to 100
  devices: MediaDeviceInfo[];
  activeDeviceId: string;
  error: string | null;
}

export function useSpeaker() {
  const [state, setState] = useState<SpeakerState>({
    isPlaying: false,
    isPlayingLeft: false,
    isPlayingRight: false,
    isPlayingNoise: false,
    frequency: 1000,
    volume: 50,
    devices: [],
    activeDeviceId: "default",
    error: null,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorNodeRef = useRef<OscillatorNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const pannerNodeRef = useRef<StereoPannerNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize audio nodes
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      
      const gain = ctx.createGain();
      gain.gain.value = state.volume / 100;
      
      // Try to create StereoPannerNode, fallback to regular destination if unavailable
      let panner: StereoPannerNode | null = null;
      if (ctx.createStereoPanner) {
        panner = ctx.createStereoPanner();
        panner.pan.value = 0; // Center
        panner.connect(ctx.destination);
        gain.connect(panner);
      } else {
        gain.connect(ctx.destination);
      }
      
      audioContextRef.current = ctx;
      gainNodeRef.current = gain;
      pannerNodeRef.current = panner;
    }
    
    // Resume context if suspended
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  }, [state.volume]);

  // Update volume gain dynamically
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = state.volume / 100;
    }
  }, [state.volume]);

  // Clean up running audio
  const stopAll = useCallback(() => {
    if (oscillatorNodeRef.current) {
      try {
        oscillatorNodeRef.current.stop();
      } catch {}
      oscillatorNodeRef.current.disconnect();
      oscillatorNodeRef.current = null;
    }

    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop();
      } catch {}
      noiseNodeRef.current.disconnect();
      noiseNodeRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isPlaying: false,
      isPlayingLeft: false,
      isPlayingRight: false,
      isPlayingNoise: false,
    }));
  }, []);

  // Play standard test tone (sine wave)
  const playTone = useCallback((freq = state.frequency, pan = 0) => {
    stopAll();
    initAudio();

    const ctx = audioContextRef.current;
    const gain = gainNodeRef.current;
    const panner = pannerNodeRef.current;
    if (!ctx || !gain) return;

    // Set pan if panner exists
    if (panner) {
      panner.pan.setValueAtTime(pan, ctx.currentTime);
    }

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.connect(gain);
    
    osc.start();
    oscillatorNodeRef.current = osc;

    setState((prev) => ({
      ...prev,
      isPlaying: pan === 0,
      isPlayingLeft: pan < 0,
      isPlayingRight: pan > 0,
      isPlayingNoise: false,
      frequency: freq,
    }));
  }, [state.frequency, initAudio, stopAll]);

  // Play white noise for general speaker diagnostic
  const playWhiteNoise = useCallback(() => {
    stopAll();
    initAudio();

    const ctx = audioContextRef.current;
    const gain = gainNodeRef.current;
    const panner = pannerNodeRef.current;
    if (!ctx || !gain) return;

    if (panner) {
      panner.pan.setValueAtTime(0, ctx.currentTime); // Center
    }

    // Generate white noise buffer (2 seconds long)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1; // Random values from -1.0 to 1.0
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    noiseSource.connect(gain);
    
    noiseSource.start();
    noiseNodeRef.current = noiseSource;

    setState((prev) => ({
      ...prev,
      isPlaying: false,
      isPlayingLeft: false,
      isPlayingRight: false,
      isPlayingNoise: true,
    }));
  }, [initAudio, stopAll]);

  // Enumerate speaker output devices
  const updateDevices = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices) return;
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const speakerDevices = allDevices.filter((device) => device.kind === "audiooutput");
      setState((prev) => ({ ...prev, devices: speakerDevices }));
    } catch {}
  }, []);

  // Route audio to selected speaker device (using setSinkId, experimental Chrome/Edge/Firefox API)
  const selectDevice = useCallback(async (deviceId: string) => {
    setState((prev) => ({ ...prev, activeDeviceId: deviceId }));
    
    const ctx = audioContextRef.current;
    if (ctx && (ctx as any).setSinkId) {
      try {
        await (ctx as any).setSinkId(deviceId);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Failed to set audio output device.",
        }));
      }
    }
  }, []);

  useEffect(() => {
    updateDevices();
    if (typeof window !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener("devicechange", updateDevices);
      return () => {
        navigator.mediaDevices.removeEventListener("devicechange", updateDevices);
      };
    }
  }, [updateDevices]);

  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      stopAll();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAll]);

  return {
    ...state,
    playTone,
    playLeftChannel: () => playTone(state.frequency, -1.0),
    playRightChannel: () => playTone(state.frequency, 1.0),
    playNoise: playWhiteNoise,
    stop: stopAll,
    setVolume: (vol: number) => setState((prev) => ({ ...prev, volume: vol })),
    setFrequency: (freq: number) => {
      setState((prev) => ({ ...prev, frequency: freq }));
      if (oscillatorNodeRef.current && audioContextRef.current) {
        oscillatorNodeRef.current.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);
      }
    },
    selectDevice,
    refreshDevices: updateDevices,
  };
}
