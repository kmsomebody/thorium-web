"use client";

import { UnstableShortcutRepresentation } from "@/core/Helpers/keyboardUtilities";
import { BreakpointsMap } from "@/core/Hooks/useBreakpoints";
import { ThemeTokens } from "@/preferences/hooks/useTheming";
import { ThCollapsibility } from "@/core/Components/Actions/hooks/useCollapsibility";
import {
  ThAudioActionKeys,
  ThAudioKeys,
  ThDockingKeys,
  ThLayoutDirection,
  ThLayoutUI,
  ThSheetTypes,
  ThThemeKeys,
  ThActionsTokens,
  ThSettingsRangePrefRequired,
  ThSettingsRangeVariant,
  ThSettingsTimerPref,
  ThBackLinkPref,
  ThDockingPref,
  ThAudioPlayerComponent,
} from "./models";
import { AudioContentProtectionConfig } from "./models/protection";
import {
  ActionKey,
  } from "./preferences";
import { validateObjectKeys } from "./helpers";

export type AudioCustomizableKeys = {
  audioAction?: string;
  audio?: string;
  theme?: string;
};

export type ThAudioThemeKeys = ThThemeKeys.light | ThThemeKeys.dark;

export type ThAudioThemeKey<K extends AudioCustomizableKeys = {}> =
  K extends { theme: infer T }
    ? T extends string
      ? ThAudioThemeKeys | T
      : ThAudioThemeKeys
    : ThAudioThemeKeys;

export type AudioDefaultKeys = {
  audioAction: ThAudioActionKeys;
  theme: ThAudioThemeKeys;
};

export type AudioSettingsKey<K extends AudioCustomizableKeys> =
  K extends { audio: infer A }
    ? A extends string
      ? ThAudioKeys | A
      : ThAudioKeys
    : ThAudioKeys;

type ThAudioSkipIntervalKeys =
  | {
      [ThAudioKeys.skipInterval]: ThSettingsRangePrefRequired;
      [ThAudioKeys.skipBackwardInterval]?: never;
      [ThAudioKeys.skipForwardInterval]?: never;
    }
  | {
      [ThAudioKeys.skipInterval]?: never;
      [ThAudioKeys.skipBackwardInterval]: ThSettingsRangePrefRequired;
      [ThAudioKeys.skipForwardInterval]: ThSettingsRangePrefRequired;
    };

export type ThAudioKeyTypes<K extends AudioCustomizableKeys = AudioDefaultKeys> = {
  [ThAudioKeys.volume]: ThSettingsRangePrefRequired;
  [ThAudioKeys.playbackRate]: ThSettingsRangePrefRequired;
  [ThAudioKeys.sleepTimer]: ThSettingsTimerPref;
} & ThAudioSkipIntervalKeys & (
  K extends { audio: infer A }
    ? A extends string
      ? { [key in A]: ThSettingsRangePrefRequired }
      : {}
    : {}
);

// Key type for extensible audio primary/secondary actions

export type ThAudioActionKey<K extends AudioCustomizableKeys = {}> =
  K extends { audioAction: infer A }
    ? A extends string
      ? ThAudioActionKeys | A
      : ThAudioActionKeys
    : ThAudioActionKeys;

// Actions preference

/**
 * Primary zone (media controls bar). Components resolved via the plugin
 * registry's primaryAudioActions. No ThActionsTokens, no visibility.
 * Volume and playback rate are primary-only.
 *
 * Secondary zone (header collapsible bar). Keys resolved via the plugin
 * registry's actionsComponentsMap. Visibility applies here (collapse).
 * Compatible with CollapsiblePref.
 */
export interface ThAudioActionsPref<K extends AudioCustomizableKeys = {}> {
  primary: {
    displayOrder: Array<ThAudioActionKey<K>>;
  };
  secondary: {
    displayOrder: Array<ActionKey<{ action: ThAudioActionKey<K> }> | ThAudioActionKey<K>>;
    collapse: ThCollapsibility;
    keys: Record<string, ThActionsTokens>;
  };
}

// Main audio preferences

export type ThAudioConstraintKeys =
  | Extract<ThSheetTypes, ThSheetTypes.bottomSheet | ThSheetTypes.popover>
  | "pagination"
  | "dropdown";

export interface ThAudioPreferences<K extends AudioCustomizableKeys = {}> {
  direction?: ThLayoutDirection;
  locale?: string;

  theming: {
    header?: {
      backLink?: ThBackLinkPref | null;
    };
    icon: {
      size: number;
      tooltipOffset: number;
      tooltipDelay?: number;
    };
    layout: {
      /** Overall layout mode for the audio player UI. */
      ui?: ThLayoutUI;
      /** Ordered list of player components to render. */
      order: Array<ThAudioPlayerComponent>;
      radius: number;
      spacing: number;
      defaults: {
        dockingWidth: number;
        scrim: string;
      };
      constraints?: {
        [key in ThAudioConstraintKeys]?: number | null;
      };
    };
    breakpoints: BreakpointsMap<number | null>;
    themes: {
      audioOrder: Array<ThAudioThemeKey<K> | "auto">;
      systemThemes?: {
        light: ThAudioThemeKey<K>;
        dark: ThAudioThemeKey<K>;
      };
      keys: Record<Exclude<ThAudioThemeKey<K>, "auto"> & string, ThemeTokens>;
    };
  };

  actions: ThAudioActionsPref<K>;

  settings: {
    order: Array<AudioSettingsKey<K>>;
    keys: ThAudioKeyTypes<K>;
  };

  contentProtection?: AudioContentProtectionConfig;

  shortcuts: {
    representation: UnstableShortcutRepresentation;
    joiner?: string;
  };

  docking: ThDockingPref<ThDockingKeys>;
}

// Validation 

const validateRangePresets = (pref: ThSettingsRangePrefRequired, context: string): void => {
  if (pref.variant !== ThSettingsRangeVariant.sliderWithPresets || !pref.presets?.length) return;
  const [min, max] = [Math.min(...pref.range), Math.max(...pref.range)];
  const step = pref.step;
  const tolerance = step * 1e-9;
  const invalid = pref.presets.filter(p => {
    if (p < min || p > max) return true;
    const offset = (p - min) / step;
    return Math.abs(offset - Math.round(offset)) > tolerance;
  });
  if (invalid.length > 0) {
    console.warn(
      `${ context }: presets [${ invalid.join(", ") }] are not reachable with range=[${ min }, ${ max }] and step=${ step }.`
    );
  }
};

export const createAudioPreferences = <K extends AudioCustomizableKeys = {}>(
  params: ThAudioPreferences<K>
): ThAudioPreferences<K> => {
  // Validate secondary action keys
  if (params.actions?.secondary) {
    validateObjectKeys<string, ThActionsTokens>(
      [params.actions.secondary.displayOrder as string[]],
      params.actions.secondary.keys as Record<string, ThActionsTokens>,
      "actions.secondary"
    );
  }

  // Validate audio skip interval mutual exclusivity
  if (params.settings?.order) {
    const order = params.settings.order as string[];
    const hasSkipInterval = order.includes(ThAudioKeys.skipInterval);
    const hasSplitIntervals =
      order.includes(ThAudioKeys.skipBackwardInterval) ||
      order.includes(ThAudioKeys.skipForwardInterval);
    if (hasSkipInterval && hasSplitIntervals) {
      console.warn(
        `settings.order contains both "${ ThAudioKeys.skipInterval }" and split interval keys. Use one or the other.`
      );
    }
  }

  // Validate theme keys
  if (params.theming?.themes) {
    validateObjectKeys<ThAudioThemeKey<K> | "auto", ThemeTokens>(
      [params.theming.themes.audioOrder as Array<ThAudioThemeKey<K> | "auto">],
      params.theming.themes.keys as Record<string, ThemeTokens>,
      "theming.themes",
      "auto"
    );
  }

  // Validate range presets in settings keys
  Object.entries(params.settings?.keys ?? {}).forEach(([key, pref]) => {
    if (pref && typeof pref === "object" && "variant" in pref) {
      validateRangePresets(pref as ThSettingsRangePrefRequired, `settings.keys.${ key }`);
    }
  });

  return params;
};