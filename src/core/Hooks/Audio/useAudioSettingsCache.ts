"use client";

import { useRef, useMemo } from "react";

export interface AudioSettings {
  volume: number;
  playbackRate: number;
  preservePitch: boolean;
  skipBackwardInterval: number;
  skipForwardInterval: number;
  skipInterval: number;
  pollInterval: number;
  autoPlay: boolean;
  enableMediaSession: boolean;
}

export interface AudioSettingsCache {
  settings: AudioSettings;
}

export const useAudioSettingsCache = (
  volume: number,
  playbackRate: number,
  preservePitch: boolean,
  skipBackwardInterval: number,
  skipForwardInterval: number,
  skipInterval: number,
  pollInterval: number,
  autoPlay: boolean,
  enableMediaSession: boolean
) => {
  const cache = useRef<AudioSettingsCache>({
    settings: {
      volume,
      playbackRate,
      preservePitch,
      skipBackwardInterval,
      skipForwardInterval,
      skipInterval,
      pollInterval,
      autoPlay,
      enableMediaSession,
    },
  });

  const memoizedCache = useMemo(() => ({
    settings: {
      volume,
      playbackRate,
      preservePitch,
      skipBackwardInterval,
      skipForwardInterval,
      skipInterval,
      pollInterval,
      autoPlay,
      enableMediaSession,
    },
  }), [
    volume,
    playbackRate,
    preservePitch,
    skipBackwardInterval,
    skipForwardInterval,
    skipInterval,
    pollInterval,
    autoPlay,
    enableMediaSession,
  ]);

  cache.current = memoizedCache;

  return cache;
};
