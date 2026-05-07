"use client";

import { useMemo } from "react";

import { ThPreferences } from "@/preferences";
import { AudioSettings } from "@/core/Hooks/Audio/useAudioSettingsCache";

interface UseAudioPreferencesConfigProps {
  settings: AudioSettings;
  preferences: ThPreferences;
}

export const useAudioPreferencesConfig = ({
  settings,
  preferences,
}: UseAudioPreferencesConfigProps) => {
  const audioPreferences = useMemo(() => {
    return {
      volume: settings.volume,
      playbackRate: settings.playbackRate,
      preservePitch: settings.preservePitch,
      skipBackwardInterval: settings.skipBackwardInterval,
      skipForwardInterval: settings.skipForwardInterval,
      pollInterval: settings.pollInterval,
      autoPlay: settings.autoPlay,
      enableMediaSession: settings.enableMediaSession,
    };
  }, [settings]);

  const audioDefaults = useMemo(() => {
    return {
      volume: 1.0,
      playbackRate: 1.0,
      preservePitch: true,
      skipBackwardInterval: 10,
      skipForwardInterval: 10,
      pollInterval: 1000,
      autoPlay: false,
      enableMediaSession: true,
    };
  }, []);

  return { audioPreferences, audioDefaults };
};
