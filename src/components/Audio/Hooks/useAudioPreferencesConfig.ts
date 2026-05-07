"use client";

import { useMemo } from "react";

import { ThAudioPreferences } from "@/preferences/audioPreferences";
import { ThAudioKeys } from "@/preferences/models/audio";
import { AudioSettings } from "@/core/Hooks/Audio/useAudioSettingsCache";

interface UseAudioPreferencesConfigProps {
  settings: AudioSettings;
  preferences: ThAudioPreferences;
}

export const useAudioPreferencesConfig = ({
  settings,
  preferences,
}: UseAudioPreferencesConfigProps) => {
  const audioPreferences = useMemo(() => {
    const isSkipIntervalMode = ThAudioKeys.skipInterval in preferences.settings.keys;
    return {
      volume: settings.volume,
      playbackRate: settings.playbackRate,
      preservePitch: settings.preservePitch,
      skipBackwardInterval: isSkipIntervalMode ? settings.skipInterval : settings.skipBackwardInterval,
      skipForwardInterval: isSkipIntervalMode ? settings.skipInterval : settings.skipForwardInterval,
      pollInterval: settings.pollInterval,
      autoPlay: settings.autoPlay,
      enableMediaSession: settings.enableMediaSession,
    };
  }, [settings, preferences.settings.keys]);

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
