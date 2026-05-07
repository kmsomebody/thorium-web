"use client";

import { useContext } from "react";
import { ThActionsTokens, ThAudioActionsTokens, ThDockingKeys, ThDockingPref } from "../models";
import { ThAudioPreferencesContext } from "../ThAudioPreferencesContext";
import { ThPreferencesContext } from "../ThPreferencesContext";

export interface ActionsPreferences {
  docking: ThDockingPref<ThDockingKeys>;
  actionsKeys: Record<string, ThActionsTokens | ThAudioActionsTokens>;
}

export interface AudioActionsPreferences {
  docking: ThDockingPref<ThDockingKeys>;
  primaryActionsKeys: Record<string, ThAudioActionsTokens>;
  secondaryActionsKeys: Record<string, ThActionsTokens>;
}

/**
 * Context-agnostic hook for docking/actions infrastructure.
 * Resolves preferences from the audio context when available,
 * falling back to the reader context. This allows shared
 * components (docking, action containers) to work in both.
 */
export const useActionsPreferences = (): ActionsPreferences => {
  const audioCtx = useContext(ThAudioPreferencesContext);
  const readerCtx = useContext(ThPreferencesContext);

  if (audioCtx) {
    return {
      docking: audioCtx.preferences.docking,
      actionsKeys: {
        ...audioCtx.preferences.actions.primary.keys,
        ...audioCtx.preferences.actions.secondary.keys,
      },
    };
  }

  if (readerCtx) {
    return {
      docking: readerCtx.preferences.docking,
      actionsKeys: readerCtx.preferences.actions.keys as Record<string, ThActionsTokens>,
    };
  }

  throw new Error("useActionsPreferences must be used within a ThPreferencesProvider or ThAudioPreferencesProvider");
};

export const useAudioActionsPreferences = (): AudioActionsPreferences => {
  const audioCtx = useContext(ThAudioPreferencesContext);

  if (!audioCtx) {
    throw new Error("useAudioActionsPreferences must be used within a ThAudioPreferencesProvider");
  }

  return {
    docking: audioCtx.preferences.docking,
    primaryActionsKeys: audioCtx.preferences.actions.primary.keys,
    secondaryActionsKeys: audioCtx.preferences.actions.secondary.keys,
  };
};
