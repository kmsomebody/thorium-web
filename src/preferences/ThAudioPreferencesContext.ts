"use client";

import { createContext } from "react";
import { defaultAudioPreferences } from "./defaultAudioPreferences";
import { ThAudioPreferences, AudioCustomizableKeys, AudioDefaultKeys } from "./audioPreferences";

export interface AudioPreferencesContextValue<K extends AudioCustomizableKeys = AudioDefaultKeys> {
  preferences: ThAudioPreferences<K>;
  updatePreferences: (prefs: ThAudioPreferences<K>) => void;
}

export const ThAudioPreferencesContext = createContext<AudioPreferencesContextValue<any> | null>(null);

export const defaultAudioPreferencesContextValue: AudioPreferencesContextValue<AudioDefaultKeys> = {
  preferences: defaultAudioPreferences as ThAudioPreferences<AudioDefaultKeys>,
  updatePreferences: () => {
    throw new Error("updatePreferences must be used within a ThAudioPreferencesProvider");
  },
};
