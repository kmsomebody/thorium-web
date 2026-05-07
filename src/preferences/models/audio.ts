"use client";

import { ThCollapsibilityVisibility } from "@/core/Components/Actions/hooks/useCollapsibility";
import { ThActionsTokens, ThAudioActionsTokens, ThDockingTypes, ThSheetTypes } from "./actions";
import { ThBreakpoints } from "./ui";
import { ThSettingsRangePrefRequired, ThSettingsRangeVariant, ThSettingsRangePlaceholder } from "./settings";

export enum ThAudioActionKeys {
  toc = "audio.toc",
  volume = "audio.volume",
  playbackRate = "audio.playbackRate",
  sleepTimer = "audio.sleepTimer",
  remotePlayback = "audio.remotePlayback",
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
      /** Preset durations in minutes, or "endOfResource" to pause at end of track. */
      presets: (number | "endOfResource")[];
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
  range: [0.5, 4],
  step: 0.05,
  placeholder: ThSettingsRangePlaceholder.range,
  presets: [0.75, 1, 1.25, 1.5, 1.75, 2]
}

export const defaultAudioSkipBackwardInterval: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.presetsGroup,
  range: [5, 60],
  step: 5,
  placeholder: ThSettingsRangePlaceholder.range,
  presets: [5, 10, 30]
}

export const defaultAudioSkipForwardInterval: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.presetsGroup,
  range: [5, 60],
  step: 5,
  placeholder: ThSettingsRangePlaceholder.range,
  presets: [5, 10, 30]
}

export const defaultAudioSkipInterval: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.presetsGroup,
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
  presets: [15, 30, 45, 60, 90, "endOfResource"],
};

// Action tokens for ThAudioActionKeys.
// Primary-zone tokens (volume, playbackRate) live in actions.primary.keys and must use compactPopover
// Secondary-zone tokens (toc, sleepTimer, remotePlayback) live in actions.secondary.keys and must use regular popover
export const defaultAudioVolumeAction: ThAudioActionsTokens = {
  visibility: ThCollapsibilityVisibility.always,
  shortcut: null,
  sheet: {
    defaultSheet: ThSheetTypes.compactPopover,
    breakpoints: {}
  },
  docked: { dockable: ThDockingTypes.none }
};

export const defaultAudioPlaybackRateAction: ThAudioActionsTokens = {
  visibility: ThCollapsibilityVisibility.always,
  shortcut: null,
  sheet: {
    defaultSheet: ThSheetTypes.compactPopover,
    breakpoints: { [ThBreakpoints.compact]: ThSheetTypes.bottomSheet }
  },
  snapped: {
    minHeight: "content-height"
  },
  docked: { dockable: ThDockingTypes.none }
};

export const defaultAudioSleepTimerAction: ThAudioActionsTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: null,
  sheet: {
    defaultSheet: ThSheetTypes.compactPopover,
    breakpoints: { [ThBreakpoints.compact]: ThSheetTypes.bottomSheet }
  },
  snapped: {
    minHeight: "content-height"
  },
  docked: { dockable: ThDockingTypes.none }
};

export const defaultAudioRemotePlaybackAction: ThActionsTokens = {
  visibility: ThCollapsibilityVisibility.always,
  shortcut: null
};

export const defaultAudioTocAction: ThAudioActionsTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: null,
  sheet: {
    defaultSheet: ThSheetTypes.modal,
    breakpoints: {
      [ThBreakpoints.compact]: ThSheetTypes.fullscreen,
      [ThBreakpoints.medium]: ThSheetTypes.fullscreen
    }
  },
  docked: { dockable: ThDockingTypes.both }
};
