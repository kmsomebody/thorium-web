"use client";

import { useAppSelector } from "@/lib/hooks";
import { initialSettingsState, SettingsReducerState } from "@/lib/settingsReducer";
import { initialWebPubSettingsState, WebPubSettingsReducerState } from "@/lib/webPubSettingsReducer";

type SharedSettingsKey = keyof SettingsReducerState & keyof WebPubSettingsReducerState;

export function useReaderSetting(key: "zoom"): number;
export function useReaderSetting<K extends SharedSettingsKey>(key: K): SettingsReducerState[K];
export function useReaderSetting<K extends SharedSettingsKey>(key: K | "zoom") {
  return useAppSelector(state => {
    const isWebPub = state.reader.profile === "webPub";

    if (key === "zoom") {
      if (isWebPub) {
        const val = state.webPubSettings.zoom;
        return val !== undefined ? val : initialWebPubSettingsState.zoom;
      }
      const val = state.settings.fontSize;
      return val !== undefined ? val : initialSettingsState.fontSize;
    }

    if (isWebPub) {
      const val = state.webPubSettings[key as SharedSettingsKey];
      return (val !== undefined ? val : initialWebPubSettingsState[key as SharedSettingsKey]) as SettingsReducerState[K];
    }

    const val = state.settings[key as SharedSettingsKey];
    return val !== undefined ? val : initialSettingsState[key as SharedSettingsKey];
  });
}
