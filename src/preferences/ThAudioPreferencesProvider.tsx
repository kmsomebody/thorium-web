"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ThAudioPreferences, AudioCustomizableKeys, AudioDefaultKeys } from "./audioPreferences";
import {
  ThAudioPreferencesContext,
  defaultAudioPreferencesContextValue,
} from "./ThAudioPreferencesContext";

import { ThAudioMemoryPreferencesAdapter } from "./adapters/ThAudioMemoryPreferencesAdapter";
import { ThAudioPreferencesAdapter } from "./adapters/ThAudioPreferencesAdapter";
import { devContentProtectionConfig } from "./models/protection";

type Props<K extends AudioCustomizableKeys = AudioDefaultKeys> = {
  adapter?: ThAudioPreferencesAdapter<K>;
  initialPreferences?: ThAudioPreferences<K>;
  devMode?: boolean;
  children: React.ReactNode;
};

export function ThAudioPreferencesProvider<K extends AudioCustomizableKeys = AudioDefaultKeys>({
  adapter,
  initialPreferences,
  devMode,
  children,
}: Props<K>) {
  const effectiveAdapter = useMemo(() => {
    let fallback = defaultAudioPreferencesContextValue.preferences as ThAudioPreferences<K>;
    if (devMode && !initialPreferences) {
      fallback = { ...fallback, contentProtection: devContentProtectionConfig };
    }
    return adapter || new ThAudioMemoryPreferencesAdapter<K>(
      (initialPreferences as ThAudioPreferences<K>) || fallback
    );
  }, [adapter, initialPreferences, devMode]);

  const [preferences, setPreferences] = useState<ThAudioPreferences<K>>(
    (() => {
      let fallback = defaultAudioPreferencesContextValue.preferences as ThAudioPreferences<K>;
      if (devMode && !initialPreferences) {
        fallback = { ...fallback, contentProtection: devContentProtectionConfig };
      }
      return (initialPreferences as ThAudioPreferences<K>) || fallback;
    })()
  );

  const handlePreferenceChange = useCallback((newPrefs: ThAudioPreferences<K>) => {
    setPreferences(prev =>
      JSON.stringify(prev) === JSON.stringify(newPrefs) ? prev : newPrefs
    );
  }, []);

  useEffect(() => {
    effectiveAdapter.subscribe(handlePreferenceChange);
    return () => {
      effectiveAdapter.unsubscribe(handlePreferenceChange);
    };
  }, [effectiveAdapter, handlePreferenceChange]);

  const contextValue = useMemo(() => ({
    preferences,
    updatePreferences: (newPrefs: ThAudioPreferences<K>) => {
      effectiveAdapter.setPreferences(newPrefs);
    },
  }), [preferences, effectiveAdapter]);

  return (
    <ThAudioPreferencesContext.Provider value={ contextValue }>
      { children }
    </ThAudioPreferencesContext.Provider>
  );
}
