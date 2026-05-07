"use client";

import { useCallback, useEffect, useState, useRef } from "react";

import { Locator, LocatorLocations, Publication } from "@readium/shared";
import { AudioNavigatorListeners, IAudioContentProtectionConfig } from "@readium/navigator";
import { ThAudioPreferences } from "@/preferences/audioPreferences";

import { AudioStatelessCache } from "./useAudioStatelessCache";
import { useAudioPreferencesConfig } from "./useAudioPreferencesConfig";
import { useAudioNavigator, AudioNavigatorLoadProps } from "@/core/Hooks/Audio/useAudioNavigator";

interface UseAudioPlayerInitProps {
  publication: Publication | null;
  initialPosition: Locator | null;
  listeners: AudioNavigatorListeners;
  preferences: ThAudioPreferences;
  cache: React.RefObject<AudioStatelessCache>;
  contentProtectionConfig?: IAudioContentProtectionConfig;
  onNavigatorReady?: () => void;
  onNavigatorLoaded?: () => void;
  onCleanup?: () => void;
}

export const useAudioPlayerInit = ({
  publication,
  initialPosition,
  listeners,
  preferences,
  cache,
  contentProtectionConfig,
  onNavigatorReady,
  onNavigatorLoaded,
  onCleanup,
}: UseAudioPlayerInitProps) => {
  const [navigatorReady, setNavigatorReady] = useState(false);

  const { audioPreferences, audioDefaults } = useAudioPreferencesConfig({
    settings: cache.current.settings,
    preferences,
  });

  const handleCleanup = useCallback(() => {
    onCleanup?.();
  }, [onCleanup]);

  const { AudioNavigatorLoad, AudioNavigatorDestroy } = useAudioNavigator();
  const isNavigatorLoadedAudio = useRef(false);

  useEffect(() => {
    // Only initialize once, never re-render
    if (!publication || isNavigatorLoadedAudio.current) return;

    // Initialize navigator for Audio

    const config: AudioNavigatorLoadProps = {
      publication,
      listeners,
      initialPosition: initialPosition ? new Locator({
        ...initialPosition,
        locations: initialPosition.locations ? new LocatorLocations(initialPosition.locations) : undefined
      }) : undefined,
      preferences: audioPreferences,
      defaults: audioDefaults,
      contentProtection: contentProtectionConfig,
    };

    isNavigatorLoadedAudio.current = true;

    // Call onNavigatorReady outside of navigator load
    onNavigatorReady?.();

    // Pass onNavigatorLoaded as the callback to AudioNavigatorLoad
    AudioNavigatorLoad(config, () => {
      // Set navigatorReady to true only after navigator actually loads
      setNavigatorReady(true);
      onNavigatorLoaded?.();
    });

    return () => {
      if (isNavigatorLoadedAudio.current) {
        setNavigatorReady(false);
        AudioNavigatorDestroy(() => {
          isNavigatorLoadedAudio.current = false;
          handleCleanup();
        });
      }
    };
  }, []);

  return {
    navigatorReady,
  };
};
