"use client";

import { useMemo } from "react";

import { ScriptMode } from "@readium/navigator";
import { useAppSelector } from "@/lib/hooks";
import {
  ThSettingsKeys,
  ThTextSettingsKeys,
  ThSpacingSettingsKeys
} from "@/preferences/models";
import { usePreferenceKeys } from "./usePreferenceKeys";

const EXCLUDED_CJK = [
  ThTextSettingsKeys.textAlign,
  ThTextSettingsKeys.hyphens,
  ThTextSettingsKeys.ligatures,
  ThSpacingSettingsKeys.paragraphIndent,
  ThSpacingSettingsKeys.wordSpacing,
  ThTextSettingsKeys.textNormalize,
];

// Keys that are not applicable for each script mode and should be hidden from settings UI
const EXCLUDED_BY_SCRIPT_MODE: Record<ScriptMode, string[]> = {
  "ltr": [
    ThTextSettingsKeys.noRuby,
  ],
  "rtl": [
    ThTextSettingsKeys.hyphens,
    ThSpacingSettingsKeys.letterSpacing,
    ThTextSettingsKeys.textNormalize,
    ThTextSettingsKeys.noRuby,
  ],
  "cjk-horizontal": EXCLUDED_CJK,
  "cjk-vertical": [...EXCLUDED_CJK, ThSettingsKeys.layout],
  "mongolian-vertical": [...EXCLUDED_CJK, ThSettingsKeys.layout],
};

/**
 * Wraps usePreferenceKeys and filters out settings keys that are not applicable
 * for the current publication's script mode (RTL, CJK-horizontal, CJK-vertical).
 * Drop-in replacement for usePreferenceKeys at all call sites.
 */
export const useFilteredPreferenceKeys = () => {
  const keys = usePreferenceKeys();
  const scriptMode = useAppSelector(state => state.publication.scriptMode);
  const isFXL = useAppSelector(state => state.publication.isFXL);

  return useMemo(() => {
    const excluded = [
      ...(EXCLUDED_BY_SCRIPT_MODE[scriptMode] ?? []),
      ...((scriptMode === "cjk-vertical" || scriptMode === "mongolian-vertical") && !isFXL
        ? [ThSettingsKeys.columns]
        : []),
    ];
    if (excluded.length === 0) return keys;

    const filter = <T extends string>(arr: T[]): T[] =>
      arr.filter(k => !excluded.includes(k));

    return {
      ...keys,
      reflowSettingsKeys: filter(keys.reflowSettingsKeys),
      fxlSettingsKeys: filter(keys.fxlSettingsKeys),
      webPubSettingsKeys: filter(keys.webPubSettingsKeys),
      mainTextSettingsKeys: filter(keys.mainTextSettingsKeys),
      subPanelTextSettingsKeys: filter(keys.subPanelTextSettingsKeys),
      mainSpacingSettingsKeys: filter(keys.mainSpacingSettingsKeys),
      subPanelSpacingSettingsKeys: filter(keys.subPanelSpacingSettingsKeys),
    };
  }, [keys, scriptMode, isFXL]);
};
