"use client";

import { createContext } from "react";
import { ThGlobalPreferences } from "./globalPreferences";

export interface GlobalPreferencesContextValue {
  preferences: ThGlobalPreferences;
  updatePreferences: (prefs: ThGlobalPreferences) => void;
}

export const ThGlobalPreferencesContext = createContext<GlobalPreferencesContextValue | null>(null);
