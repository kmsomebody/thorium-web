import { ThGlobalPreferences } from "../globalPreferences";

export interface ThGlobalPreferencesAdapter {
  getPreferences(): ThGlobalPreferences;
  setPreferences(prefs: ThGlobalPreferences): void;
  subscribe(callback: (prefs: ThGlobalPreferences) => void): void;
  unsubscribe(callback: (prefs: ThGlobalPreferences) => void): void;
}
