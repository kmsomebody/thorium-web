"use client";

import { useMemo, useRef } from "react";
import { AudioSettingsCache, useAudioSettingsCache } from "@/core/Hooks/Audio/useAudioSettingsCache";

export interface AudioStatelessCache extends AudioSettingsCache {
  sleepTimerOnTrackEnd: boolean;
}

export const useAudioStatelessCache = (
  volume: number,
  playbackRate: number,
  preservePitch: boolean,
  skipBackwardInterval: number,
  skipForwardInterval: number,
  skipInterval: number,
  pollInterval: number,
  autoPlay: boolean,
  enableMediaSession: boolean,
  sleepTimerOnTrackEnd: boolean
) => {
  const settingsCache = useAudioSettingsCache(
    volume,
    playbackRate,
    preservePitch,
    skipBackwardInterval,
    skipForwardInterval,
    skipInterval,
    pollInterval,
    autoPlay,
    enableMediaSession
  );

  const cache = useRef<AudioStatelessCache>({
    ...settingsCache.current,
    sleepTimerOnTrackEnd,
  });

  const memoizedCache = useMemo(() => ({
    ...settingsCache.current,
    sleepTimerOnTrackEnd,
  }), [settingsCache, sleepTimerOnTrackEnd]);

  cache.current = memoizedCache;

  return cache;
};
