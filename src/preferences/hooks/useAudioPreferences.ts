"use client";

import { useContext } from "react";
import { ThAudioPreferencesContext } from "../ThAudioPreferencesContext";
import { ThAudioPreferences, AudioCustomizableKeys, AudioDefaultKeys } from "../audioPreferences";

export function useAudioPreferences<K extends AudioCustomizableKeys = AudioDefaultKeys>() {
  const context = useContext(ThAudioPreferencesContext);

  if (!context) {
    throw new Error("useAudioPreferences must be used within a ThAudioPreferencesProvider");
  }

  return {
    preferences: context.preferences as ThAudioPreferences<K>,
    updatePreferences: context.updatePreferences as (prefs: ThAudioPreferences<K>) => void,
  };
}
