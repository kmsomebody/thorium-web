"use client";

import { UnstableShortcutRepresentation } from "@/core/Helpers/keyboardUtilities";
import { ThCollapsibilityVisibility } from "@/core/Components/Actions/hooks/useCollapsibility";
import {
  ThActionsKeys,
  ThAudioActionKeys,
  ThAudioKeys,
  ThAudioPlayerComponent,
  ThBreakpoints,
  ThDockingKeys,
  ThDockingTypes,
  ThLayoutUI,
  ThSheetTypes,
  ThThemeKeys,
  ThBackLinkVariant,
  lightTheme,
  darkTheme,
  defaultSettingsAction,
  defaultAudioTocAction,
  defaultAudioSleepTimerAction,
  defaultAudioContentProtectionConfig,
  defaultAudioVolume,
  defaultAudioPlaybackRate,
  defaultAudioSkipBackwardInterval,
  defaultAudioSkipForwardInterval,
  defaultAudioSleepTimer,
} from "./models";
import { createAudioPreferences, ThAudioPreferences, AudioDefaultKeys } from "./audioPreferences";

export const defaultAudioPreferences: ThAudioPreferences<AudioDefaultKeys> =
  createAudioPreferences<AudioDefaultKeys>({
    theming: {
      header: {
        backLink: {
          variant: ThBackLinkVariant.arrow,
          visibility: "partially",
          href: "/"
        }
      },
      icon: {
        size: 24,
        tooltipOffset: 10
      },
      layout: {
        ui: ThLayoutUI.stacked,
        order: [
          ThAudioPlayerComponent.cover,
          ThAudioPlayerComponent.metadata,
          ThAudioPlayerComponent.playbackControls,
          ThAudioPlayerComponent.progressBar,
          ThAudioPlayerComponent.mediaActions
        ],
        radius: 5,
        spacing: 20,
        defaults: {
          dockingWidth: 340,
          scrim: "rgba(0, 0, 0, 0.2)"
        },
        constraints: {
          [ThSheetTypes.bottomSheet]: 600,
          [ThSheetTypes.popover]: 600,
          pagination: 1024,
          dropdown: 250
        }
      },
      breakpoints: {
        [ThBreakpoints.compact]: 600,
        [ThBreakpoints.medium]: 840,
        [ThBreakpoints.expanded]: 1200,
        [ThBreakpoints.large]: 1600,
        [ThBreakpoints.xLarge]: null
      },
      themes: {
        audioOrder: [
          "auto",
          ThThemeKeys.light,
          ThThemeKeys.dark
        ],
        systemThemes: {
          light: ThThemeKeys.light,
          dark: ThThemeKeys.dark
        },
        keys: {
          [ThThemeKeys.light]: lightTheme,
          [ThThemeKeys.dark]: darkTheme
        }
      }
    },

    actions: {
      primary: {
        displayOrder: [
          ThAudioActionKeys.volume,
          ThAudioActionKeys.playbackRate,
          ThAudioActionKeys.toc,
          ThAudioActionKeys.sleepTimer
        ]
      },
      secondary: {
        displayOrder: [
          ThActionsKeys.settings
        ],
        collapse: {
          [ThBreakpoints.compact]: 2,
          [ThBreakpoints.medium]: 3
        },
        keys: {
          [ThActionsKeys.settings]: defaultSettingsAction,
          [ThAudioActionKeys.toc]: defaultAudioTocAction,
          [ThAudioActionKeys.sleepTimer]: defaultAudioSleepTimerAction
        }
      }
    },

    settings: {
      order: [
        ThAudioKeys.theme,
        ThAudioKeys.skipBackwardInterval,
        ThAudioKeys.skipForwardInterval,
        ThAudioKeys.autoPlay
      ],
      keys: {
        [ThAudioKeys.volume]: defaultAudioVolume,
        [ThAudioKeys.playbackRate]: defaultAudioPlaybackRate,
        [ThAudioKeys.skipBackwardInterval]: defaultAudioSkipBackwardInterval,
        [ThAudioKeys.skipForwardInterval]: defaultAudioSkipForwardInterval,
        [ThAudioKeys.sleepTimer]: defaultAudioSleepTimer,
      }
    },

    contentProtection: defaultAudioContentProtectionConfig,

    shortcuts: {
      representation: UnstableShortcutRepresentation.symbol,
      joiner: "+"
    },

    docking: {
      displayOrder: [
        ThDockingKeys.transient,
        ThDockingKeys.start,
        ThDockingKeys.end
      ],
      // Audio secondary actions are all dockable:none — disable panels entirely
      dock: false,
      collapse: true,
      keys: {
        [ThDockingKeys.start]: { visibility: ThCollapsibilityVisibility.overflow, shortcut: null },
        [ThDockingKeys.end]: { visibility: ThCollapsibilityVisibility.overflow, shortcut: null },
        [ThDockingKeys.transient]: { visibility: ThCollapsibilityVisibility.overflow, shortcut: null }
      }
    }
  });
