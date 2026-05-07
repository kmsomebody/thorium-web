"use client";

import { ThSettingsRangePref, ThSettingsRangeVariant, ThSettingsRangePlaceholder } from "./settings";

export enum ThAudioKeys {
  theme = "theme",
  volume = "volume",
  playbackRate = "playbackRate",
  skipBackwardInterval = "skipBackwardInterval",
  skipForwardInterval = "skipForwardInterval",
  autoPlay = "autoPlay",
}

export type ThAudioSettingsKeys = Exclude<ThAudioKeys, ThAudioKeys.volume | ThAudioKeys.playbackRate>;

export const defaultAudioVolume: Required<ThSettingsRangePref> = {
  variant: ThSettingsRangeVariant.slider,
  range: [0, 1],
  step: 0.1,
  placeholder: ThSettingsRangePlaceholder.range
}

export const defaultAudioPlaybackRate: Required<ThSettingsRangePref> = {
  variant: ThSettingsRangeVariant.slider,
  range: [0.5, 2],
  step: 0.1,
  placeholder: ThSettingsRangePlaceholder.range
}

export const defaultAudioSkipBackwardInterval: Required<ThSettingsRangePref> = {
  variant: ThSettingsRangeVariant.slider,
  range: [5, 60],
  step: 5,
  placeholder: ThSettingsRangePlaceholder.range
}

export const defaultAudioSkipForwardInterval: Required<ThSettingsRangePref> = {
  variant: ThSettingsRangeVariant.slider,
  range: [5, 60],
  step: 5,
  placeholder: ThSettingsRangePlaceholder.range
}
