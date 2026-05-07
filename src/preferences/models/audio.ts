"use client";

import { ThCollapsibilityVisibility } from "@/core/Components/Actions/hooks/useCollapsibility";
import { ThActionsTokens, ThDockingTypes, ThSheetTypes } from "./actions";
import { ThSettingsRangePrefRequired, ThSettingsRangeVariant, ThSettingsRangePlaceholder } from "./settings";

export enum ThAudioActionKeys {
  toc = "audio.toc",
  volume = "audio.volume",
  playbackRate = "audio.playbackRate",
  sleepTimer = "audio.sleepTimer",
}

export enum ThAudioKeys {
  theme = "theme",
  volume = "volume",
  playbackRate = "playbackRate",
  skipBackwardInterval = "skipBackwardInterval",
  skipForwardInterval = "skipForwardInterval",
  skipInterval = "skipInterval",
  autoPlay = "autoPlay",
  sleepTimer = "sleepTimer",
}

export enum ThSettingsTimerVariant {
  presetList = "presetList",
  durationField = "durationField",
}

export type ThSettingsTimerPref =
  | {
      variant: ThSettingsTimerVariant.presetList;
      /** Preset durations in minutes. */
      presets: number[];
    }
  | {
      variant: ThSettingsTimerVariant.durationField;
      maxHours?: number;
    };

export type ThAudioSettingsKeys = Exclude<ThAudioKeys, ThAudioKeys.volume | ThAudioKeys.playbackRate>;

export const defaultAudioVolume: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.slider,
  range: [0, 1],
  step: 0.1,
  placeholder: ThSettingsRangePlaceholder.range
}

export const defaultAudioPlaybackRate: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.sliderWithPresets,
  range: [0.5, 2],
  step: 0.05,
  placeholder: ThSettingsRangePlaceholder.range,
  presets: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
}

export const defaultAudioSkipBackwardInterval: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.sliderWithPresets,
  range: [5, 60],
  step: 5,
  placeholder: ThSettingsRangePlaceholder.range,
  presets: [5, 10, 30]
}

export const defaultAudioSkipForwardInterval: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.sliderWithPresets,
  range: [5, 60],
  step: 5,
  placeholder: ThSettingsRangePlaceholder.range,
  presets: [5, 10, 30]
}

export const defaultAudioSkipInterval: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.sliderWithPresets,
  range: [5, 60],
  step: 5,
  placeholder: ThSettingsRangePlaceholder.range,
  presets: [5, 10, 30]
}

export const defaultAudioSleepTimer: ThSettingsTimerPref = {
  variant: ThSettingsTimerVariant.durationField,
  maxHours: 23,
};

export const defaultAudioSleepTimerPresetList: ThSettingsTimerPref = {
  variant: ThSettingsTimerVariant.presetList,
  presets: [15, 30, 45, 60, 90],
};

// Action tokens for ThAudioActionKeys used in the secondary zone (e.g. header bar).
// Visibility applies here (secondary collapsibility). Primary zone never uses these tokens.
// Volume and playback rate are primary-only and have no secondary tokens.
export const defaultAudioSleepTimerAction: ThActionsTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: null,
  sheet: {
    defaultSheet: ThSheetTypes.popover,
    breakpoints: {}
  },
  docked: { dockable: ThDockingTypes.none }
};

export const defaultAudioTocAction: ThActionsTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: null,
  sheet: {
    defaultSheet: ThSheetTypes.popover,
    breakpoints: {}
  },
  docked: { dockable: ThDockingTypes.none }
};
